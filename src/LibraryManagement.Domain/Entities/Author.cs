using System.Collections.Generic;
using LibraryManagement.Domain.Common;

namespace LibraryManagement.Domain.Entities
{
    public class Author : BaseAuditableEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Bio { get; set; }

        // العلاقة Many-to-Many مع الكتب عبر جدول ربط
        public ICollection<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();
    }
}