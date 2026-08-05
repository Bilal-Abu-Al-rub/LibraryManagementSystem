using System.Collections.Generic;
using LibraryManagement.Domain.Common;

namespace LibraryManagement.Domain.Entities
{
    public class Member : BaseAuditableEntity
    {
        public string Name { get; set; } = string.Empty;
        public string MembershipNumber { get; set; } = string.Empty;
        public DateTime JoinDate { get; set; }

        // ربط العضو بحساب المستخدم المسجل في نظام الـ Auth (ApplicationUser)
        public string UserId { get; set; } = string.Empty;

        // علاقة One-to-Many مع الاستعارات[cite: 1]
        public ICollection<Loan> Loans { get; set; } = new List<Loan>();
    }
}