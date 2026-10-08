using System.Linq;
using System.Threading.Tasks;
using LibraryManagement.Application.Common.Interfaces;
using LibraryManagement.Application.DTOs.Category;
using LibraryManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public CategoriesController(IApplicationDbContext context)
        {
            _context = context;
        }

        // 1. جلب جميع التصنيفات
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _context.Categories
                .Select(c => new CategoryDto 
                { 
                    Id = c.Id, 
                    Name = c.Name, 
                    Description = c.Description 
                })
                .ToListAsync();

            return Ok(new { Data = categories });
        }

        // 2. إضافة تصنيف جديد
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "اسم التصنيف مطلوب" });
            }

            var category = new Category 
            { 
                Name = dto.Name, 
                Description = dto.Description 
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new { id = category.Id, name = category.Name, description = category.Description });
        }

        // 3. تعديل تصنيف موجود
        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] CreateCategoryDto dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { message = "التصنيف غير موجود" });
            }

            if (!string.IsNullOrWhiteSpace(dto.Name))
            {
                category.Name = dto.Name;
            }
            if (dto.Description != null)
            {
                category.Description = dto.Description;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "تم تعديل التصنيف بنجاح" });
        }

        // 4. حذف تصنيف
        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { message = "التصنيف غير موجود" });
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "تم حذف التصنيف بنجاح" });
        }
    }
}