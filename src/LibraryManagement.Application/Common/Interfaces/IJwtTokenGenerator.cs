using Microsoft.AspNetCore.Identity;

namespace LibraryManagement.Application.Common.Interfaces
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(IdentityUser user, string role);
    }
}