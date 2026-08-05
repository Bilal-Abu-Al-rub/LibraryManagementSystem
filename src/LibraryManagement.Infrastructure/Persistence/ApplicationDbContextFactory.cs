using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LibraryManagement.Infrastructure.Persistence
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlServer("Server=127.0.0.1,1433;Database=LibraryManagementDb;User Id=sa;Password=MyC#courseKelmetSecret!223;TrustServerCertificate=True;Encrypt=Optional");
            return new ApplicationDbContext(optionsBuilder.Options, null!);
        }
    }
}