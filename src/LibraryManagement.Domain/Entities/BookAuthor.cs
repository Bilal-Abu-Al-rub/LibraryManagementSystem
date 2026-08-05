namespace LibraryManagement.Domain.Entities
{
    // جدول وسيط لربط الكتاب بالمؤلفين (Many-to-Many Relationship)[cite: 1]
    public class BookAuthor
    {
        public int BookId { get; set; }
        public Book Book { get; set; } = null!;

        public int AuthorId { get; set; }
        public Author Author { get; set; } = null!;
    }
}