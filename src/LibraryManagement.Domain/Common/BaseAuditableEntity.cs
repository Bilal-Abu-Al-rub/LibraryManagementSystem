using System;

namespace LibraryManagement.Domain.Common
{
    // كلاس أساسي ستورث منه جميع الـ Entities لتتبع عمليات الإنشاء والتعديل تلقائياً
    public abstract class BaseAuditableEntity
    {
        public int Id { get; set; }
        
        // حقول التدقيق المطلوب تنفيذها تلقائياً من الـ JWT Token
        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}