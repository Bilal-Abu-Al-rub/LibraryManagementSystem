namespace LibraryManagement.Application.Common.Interfaces
{
    // واجهة في طبقة Application تعرّف خدمة قراءة معرّف المستخدم الحالي بدون الاعتماد على HTTP Context مباشرة
    public interface ICurrentUserService
    {
        string? UserId { get; }
    }
}