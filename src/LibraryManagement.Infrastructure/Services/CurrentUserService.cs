using System.Security.Claims;
using LibraryManagement.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace LibraryManagement.Infrastructure.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                                ?? _httpContextAccessor.HttpContext?.User?.FindFirst("sub")?.Value;
    }
}