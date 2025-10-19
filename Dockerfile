# Use the official .NET 8 SDK for building and runtime (includes EF tools)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["PfeProject.API/PfeProject.API.csproj", "PfeProject.API/"]
COPY ["PfeProject.Application/PfeProject.Application.csproj", "PfeProject.Application/"]
COPY ["PfeProject.Domain/PfeProject.Domain.csproj", "PfeProject.Domain/"]
COPY ["PfeProject.Infrastructure/PfeProject.Infrastructure.csproj", "PfeProject.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "PfeProject.API/PfeProject.API.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/PfeProject.API"
RUN dotnet build "PfeProject.API.csproj" -c Release -o /app/build

# Publish the app
FROM build AS publish
RUN dotnet publish "PfeProject.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "PfeProject.API.dll"]
