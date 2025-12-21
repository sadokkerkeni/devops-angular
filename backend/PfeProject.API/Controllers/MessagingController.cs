using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Messages;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MessagingController : ControllerBase
    {
        private readonly IMessagingService _messagingService;

        public MessagingController(IMessagingService messagingService)
        {
            _messagingService = messagingService;
        }

        // GET: api/messaging/conversations
        [HttpGet("conversations")]
        public async Task<ActionResult<IEnumerable<ConversationReadDto>>> GetConversations()
        {
            try
            {
                var userId = GetCurrentUserId();
                var companyId = GetCurrentUserCompanyId();
                var conversations = await _messagingService.GetUserConversationsAsync(userId, companyId);
                return Ok(conversations);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/messaging/conversations/{id}
        [HttpGet("conversations/{id}")]
        public async Task<ActionResult<ConversationReadDto>> GetConversation(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var companyId = GetCurrentUserCompanyId();
                var conversation = await _messagingService.GetConversationByIdAsync(id, userId, companyId);
                if (conversation == null)
                    return NotFound(new { message = "Conversation introuvable" });
                return Ok(conversation);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/messaging/conversations
        [HttpPost("conversations")]
        public async Task<ActionResult<ConversationReadDto>> CreateOrGetConversation([FromBody] ConversationCreateDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var companyId = GetCurrentUserCompanyId();
                var conversation = await _messagingService.GetOrCreateConversationAsync(userId, dto.OtherUserId, companyId);
                return Ok(conversation);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/messaging/conversations/{id}/messages
        [HttpGet("conversations/{id}/messages")]
        public async Task<ActionResult<IEnumerable<MessageReadDto>>> GetMessages(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var companyId = GetCurrentUserCompanyId();
                var messages = await _messagingService.GetConversationMessagesAsync(id, userId, companyId);
                return Ok(messages);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/messaging/messages
        [HttpPost("messages")]
        public async Task<ActionResult<MessageReadDto>> SendMessage([FromBody] MessageCreateDto dto)
        {
            try
            {
                var senderId = GetCurrentUserId();
                var companyId = GetCurrentUserCompanyId();
                var message = await _messagingService.SendMessageAsync(dto, senderId, companyId);
                return Ok(message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/messaging/messages/{id}/read
        [HttpPut("messages/{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _messagingService.MarkMessageAsReadAsync(id, userId);
                return Ok(new { message = "Message marqué comme lu" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/messaging/unread-count
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                var companyId = GetCurrentUserCompanyId();
                var count = await _messagingService.GetUnreadCountAsync(userId, companyId);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/messaging/available-users
        [HttpGet("available-users")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAvailableUsers()
        {
            try
            {
                var userId = GetCurrentUserId();
                var companyId = GetCurrentUserCompanyId();
                var users = await _messagingService.GetAvailableUsersAsync(userId, companyId);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("Utilisateur non authentifié");
            return userId;
        }

        private int GetCurrentUserCompanyId()
        {
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (string.IsNullOrEmpty(companyIdClaim) || !int.TryParse(companyIdClaim, out var companyId))
                throw new UnauthorizedAccessException("Information de l'entreprise manquante");
            return companyId;
        }
    }
}

