using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using LibraryManagement.API.Controllers;
using LibraryManagement.Application.Common.Interfaces;
using LibraryManagement.Application.DTOs.Book;
using LibraryManagement.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace LibraryManagement.UnitTests.Controllers
{
    public class BooksControllerTests
    {
        [Fact]
        public async Task CreateBook_ShouldReturnOk_WhenBookIsCreated()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<MockDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_" + System.Guid.NewGuid())
                .Options;

            using var context = new MockDbContext(options);
            context.Categories.Add(new Category { Id = 1, Name = "Tech" });
            await context.SaveChangesAsync();

            var controller = new BooksController(context);
            var createBookDto = new CreateBookDto
            {
                Title = "Test Book",
                ISBN = "1234567890",
                PublishedYear = 2024,
                TotalCopies = 3,
                CategoryId = 1,
                AuthorIds = new List<int>()
            };

            // Act
            var result = await controller.Create(createBookDto);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeOfType<int>();
            context.Books.Count().Should().Be(1);
        }
    }

    public class MockDbContext : DbContext, IApplicationDbContext
    {
        public MockDbContext(DbContextOptions<MockDbContext> options) : base(options) { }

        public DbSet<Book> Books { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Author> Authors { get; set; } = null!;
        public DbSet<BookAuthor> BookAuthors { get; set; } = null!;
        public DbSet<Member> Members { get; set; } = null!;
        public DbSet<Loan> Loans { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<BookAuthor>()
                .HasKey(ba => new { ba.BookId, ba.AuthorId });
        }

        public Task<int> SaveChangesAsync(System.Threading.CancellationToken cancellationToken = default)
        {
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}