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

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var query = _context.Books
                .Include(b => b.Category)
                .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(b => b.Title.Contains(search) || b.ISBN.Contains(search));
            }

            var totalItems = await query.CountAsync();
            var books = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BookDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN,
                    PublishedYear = b.PublishedYear,
                    TotalCopies = b.TotalCopies,
                    AvailableCopies = b.AvailableCopies,
                    CategoryId = b.CategoryId,
                    CategoryName = b.Category.Name,
                    Authors = b.BookAuthors.Select(ba => ba.Author.Name).ToList()
                })
                .ToListAsync();

            return Ok(new { TotalItems = totalItems, Page = page, PageSize = pageSize, Data = books });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateBookDto dto)
        {
            var book = new Book
            {
                Title = dto.Title,
                ISBN = dto.ISBN,
                PublishedYear = dto.PublishedYear,
                TotalCopies = dto.TotalCopies,
                AvailableCopies = dto.TotalCopies,
                CategoryId = dto.CategoryId
            };

            foreach (var authorId in dto.AuthorIds)
            {
                book.BookAuthors.Add(new BookAuthor { AuthorId = authorId });
            }

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return Ok(book.Id);
        }
    }
}