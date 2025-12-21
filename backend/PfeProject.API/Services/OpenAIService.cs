using System.Text;
using System.Text.Json;
using System.Net.Http;
using System.Net.Http.Json;

namespace PfeProject.API.Services
{
    /// <summary>
    /// Service for interacting with OpenAI API
    /// </summary>
    public class OpenAIService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<OpenAIService> _logger;
        private readonly HttpClient _httpClient;
        private readonly string? _apiKey;
        private readonly bool _enabled;

        public OpenAIService(IConfiguration configuration, ILogger<OpenAIService> logger, IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.Timeout = TimeSpan.FromSeconds(30);

            _apiKey = _configuration["OpenAI:ApiKey"];
            _enabled = _configuration.GetValue<bool>("OpenAI:Enabled", false) && !string.IsNullOrWhiteSpace(_apiKey);

            if (_enabled)
            {
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
                _logger.LogInformation("OpenAI service initialized successfully");
            }
            else
            {
                _logger.LogWarning("OpenAI is disabled or API key is not configured");
            }
        }

        /// <summary>
        /// Check if OpenAI is enabled and configured
        /// </summary>
        public bool IsEnabled()
        {
            return _enabled;
        }

        /// <summary>
        /// Generate a chat response using OpenAI
        /// </summary>
        public async Task<string> GenerateChatResponseAsync(
            string userMessage,
            string searchHistory,
            string conversationHistory)
        {
            if (!IsEnabled())
            {
                throw new InvalidOperationException("OpenAI is not enabled or configured");
            }

            try
            {
                var model = _configuration["OpenAI:Model"] ?? "gpt-3.5-turbo";
                var maxTokens = _configuration.GetValue<int>("OpenAI:MaxTokens", 500);
                var temperature = _configuration.GetValue<double>("OpenAI:Temperature", 0.7);

                // Build system prompt with context
                var systemPrompt = BuildSystemPrompt(searchHistory, conversationHistory);

                // Create messages list for OpenAI API
                var messages = new List<object>
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userMessage }
                };

                // Add conversation history if available
                if (!string.IsNullOrWhiteSpace(conversationHistory))
                {
                    var historyLines = conversationHistory.Split('\n')
                        .Where(line => !string.IsNullOrWhiteSpace(line))
                        .TakeLast(10);

                    foreach (var line in historyLines)
                    {
                        if (line.Contains("Utilisateur:") || line.Contains("User:"))
                        {
                            var content = line.Split(':', 2).LastOrDefault()?.Trim();
                            if (!string.IsNullOrWhiteSpace(content))
                            {
                                messages.Insert(messages.Count - 1, new { role = "user", content = content });
                            }
                        }
                        else if (line.Contains("Assistant:") || line.Contains("Bot:"))
                        {
                            var content = line.Split(':', 2).LastOrDefault()?.Trim();
                            if (!string.IsNullOrWhiteSpace(content))
                            {
                                messages.Insert(messages.Count - 1, new { role = "assistant", content = content });
                            }
                        }
                    }
                }

                // Create request payload
                var requestPayload = new
                {
                    model = model,
                    messages = messages,
                    max_tokens = maxTokens,
                    temperature = temperature
                };

                // Call OpenAI API
                var response = await _httpClient.PostAsJsonAsync("https://api.openai.com/v1/chat/completions", requestPayload);
                response.EnsureSuccessStatusCode();

                var result = await response.Content.ReadFromJsonAsync<JsonElement>();
                var assistantMessage = result.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() 
                    ?? "Désolé, je n'ai pas pu générer de réponse.";

                _logger.LogInformation("OpenAI response generated successfully");
                return assistantMessage;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling OpenAI API");
                throw;
            }
        }

        /// <summary>
        /// Build system prompt with context
        /// </summary>
        private string BuildSystemPrompt(string searchHistory, string conversationHistory)
        {
            var prompt = new StringBuilder();
            
            prompt.AppendLine("Tu es un assistant intelligent pour une application de gestion logistique (PFE Project).");
            prompt.AppendLine("Tu aides les utilisateurs à naviguer dans l'application et à trouver des informations.");
            prompt.AppendLine("");
            prompt.AppendLine("Instructions importantes :");
            prompt.AppendLine("- Réponds toujours en français");
            prompt.AppendLine("- Sois concis et utile");
            prompt.AppendLine("- Utilise le contexte de l'historique de recherche pour donner des réponses pertinentes");
            prompt.AppendLine("- Si l'utilisateur demande son historique, présente-le de manière claire");
            prompt.AppendLine("- Si tu ne sais pas quelque chose, dis-le honnêtement");
            prompt.AppendLine("");

            if (!string.IsNullOrWhiteSpace(searchHistory) && !searchHistory.Contains("Aucun historique"))
            {
                prompt.AppendLine("Historique de recherche de l'utilisateur :");
                prompt.AppendLine(searchHistory);
                prompt.AppendLine("");
            }

            prompt.AppendLine("Réponds de manière naturelle et amicale.");

            return prompt.ToString();
        }
    }
}

