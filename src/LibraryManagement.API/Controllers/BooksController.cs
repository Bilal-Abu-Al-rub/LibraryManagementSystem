using System;
using System.Linq;
using System.Threading.Tasks;
using LibraryManagement.Application.Common.Interfaces;
using LibraryManagement.Application.DTOs.Book;
using LibraryManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public BooksController(IApplicationDbContext context)
        {
            _context = context;
        }

        // 1. جلب قائمة الكتب مع Pagination والتصفية بالبحث أوالقسم
        [HttpGet]
        public async Task<IActionResult> GetBooks(
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Books
                .Include(b => b.Category)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(b => b.Title.Contains(search) || b.ISBN.Contains(search));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(b => b.CategoryId == categoryId.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(b => b.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.ISBN,
                    b.PublishedYear,
                    b.TotalCopies,
                    b.AvailableCopies,
                    b.CategoryId,
                    CategoryName = b.Category != null ? b.Category.Name : null
                })
                .ToListAsync();

            return Ok(new
            {
                items,
                totalCount,
                pageNumber,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        // 2. جلب كتاب محدد بحسب الـ ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookById(int id)
        {
            var book = await _context.Books
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null) return NotFound(new { message = "الكتاب غير موجود" });

            return Ok(book);
        }

        // 3. إضافة كتاب جديد
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateBookDto dto)
        {
            var categoryId = dto.CategoryId;
            if (categoryId <= 0 || !await _context.Categories.AnyAsync(c => c.Id == categoryId))
            {
                var firstCategory = await _context.Categories.FirstOrDefaultAsync();
                if (firstCategory != null) categoryId = firstCategory.Id;
            }

            var book = new Book
            {
                Title = dto.Title,
                ISBN = dto.ISBN,
                PublishedYear = dto.PublishedYear,
                TotalCopies = dto.TotalCopies > 0 ? dto.TotalCopies : 1,
                AvailableCopies = dto.AvailableCopies > 0 ? dto.AvailableCopies : (dto.TotalCopies > 0 ? dto.TotalCopies : 1),
                CategoryId = categoryId
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync(default);

            return Ok(new { id = book.Id, message = "تمت الإضافة بنجاح" });
        }

        // 4. تعديل كتاب
        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] UpdateBookDto dto)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound(new { message = "الكتاب غير موجود" });

            if (dto.CategoryId > 0)
            {
                var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
                if (categoryExists)
                {
                    book.CategoryId = dto.CategoryId;
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.Title)) book.Title = dto.Title;
            if (!string.IsNullOrWhiteSpace(dto.ISBN)) book.ISBN = dto.ISBN;
            if (dto.PublishedYear > 0) book.PublishedYear = dto.PublishedYear;
            if (dto.TotalCopies > 0) book.TotalCopies = dto.TotalCopies;
            if (dto.AvailableCopies >= 0) book.AvailableCopies = dto.AvailableCopies;

            await _context.SaveChangesAsync(default);
            return Ok(new { message = "تم التعديل بنجاح" });
        }

        // 5. حذف كتاب
        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound(new { message = "الكتاب غير موجود" });

            _context.Books.Remove(book);
            await _context.SaveChangesAsync(default);

            return Ok(new { message = "تم الحذف بنجاح" });
        }
    }
}