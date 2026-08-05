namespace LibraryManagement.Application.DTOs.Author
{
    public class AuthorDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Biography { get; set; }
    }

    public class CreateAuthorDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Biography { get; set; }
    }
}