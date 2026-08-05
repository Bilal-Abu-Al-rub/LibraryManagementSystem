using System;

namespace LibraryManagement.Application.DTOs.Loan
{
    public class LoanDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public int MemberId { get; set; }
        public string MemberName { get; set; } = string.Empty;
        public DateTime LoanDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public bool IsReturned => ReturnDate.HasValue;
    }

    public class CreateLoanDto
    {
        public int BookId { get; set; }
        public int MemberId { get; set; }
        public int DaysToBorrow { get; set; } = 14;
    }
}