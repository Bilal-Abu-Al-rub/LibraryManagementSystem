using System;
using System.Linq;
using System.Threading.Tasks;
using LibraryManagement.Application.Common.Interfaces;
using LibraryManagement.Application.DTOs.Loan;
using LibraryManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoansController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public LoansController(IApplicationDbContext context)
        {
            _context = context;
        }

        // 1. جلب جميع الإعارات (متاح للعرض)
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllLoans()
        {
            var loans = await _context.Loans
                .Include(l => l.Book)
                .Include(l => l.Member)
                .OrderByDescending(l => l.LoanDate)
                .Select(l => new LoanDto
                {
                    Id = l.Id,
                    BookId = l.BookId,
                    BookTitle = l.Book.Title,
                    MemberId = l.MemberId,
                    MemberName = l.Member.Name,
                    LoanDate = l.LoanDate,
                    DueDate = l.DueDate,
                    ReturnDate = l.ReturnDate
                })
                .AsNoTracking()
                .ToListAsync();

            return Ok(new { data = loans });
        }

        // 2. استعارة كتاب
        [HttpPost("borrow")]
        [AllowAnonymous]
        public async Task<IActionResult> BorrowBook([FromBody] CreateLoanDto dto)
        {
            var book = await _context.Books.FindAsync(dto.BookId);
            if (book == null) return NotFound(new { message = "Book not found." });
            if (book.AvailableCopies <= 0) return BadRequest(new { message = "No available copies to borrow." });

            var member = await _context.Members.FindAsync(dto.MemberId);
            if (member == null) return NotFound(new { message = "Member not found." });

            var loan = new Loan
            {
                BookId = dto.BookId,
                MemberId = dto.MemberId,
                LoanDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(dto.DaysToBorrow)
            };

            book.AvailableCopies--;
            _context.Loans.Add(loan);
            await _context.SaveChangesAsync();

            return Ok(new { LoanId = loan.Id, Message = "Book borrowed successfully." });
        }

        // 3. إرجاع كتاب مستعار
        [HttpPost("return/{loanId}")]
        [AllowAnonymous]
        public async Task<IActionResult> ReturnBook(int loanId)
        {
            var loan = await _context.Loans.Include(l => l.Book).FirstOrDefaultAsync(l => l.Id == loanId);
            if (loan == null) return NotFound(new { message = "Loan record not found." });
            if (loan.ReturnDate.HasValue) return BadRequest(new { message = "Book has already been returned." });

            loan.ReturnDate = DateTime.UtcNow;
            loan.Book.AvailableCopies++;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Book returned successfully." });
        }
    }
}