using System.Threading;
using System.Threading.Tasks;
using LibraryManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<Book> Books { get; }
        DbSet<Author> Authors { get; }
        DbSet<Category> Categories { get; }
        DbSet<BookAuthor> BookAuthors { get; }
        DbSet<Member> Members { get; }
        DbSet<Loan> Loans { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}