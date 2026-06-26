<!-- Server Actions -->
<div class="server-actions">
    <% if (locals.botInServer) { %>
        <span class="status-badge"><i class="fas fa-check-circle"></i> Bot is in this server</span>
    <% } else { %>
        <a href="<%= locals.inviteLink || '#' %>" target="_blank" class="btn-invite"><i class="fab fa-discord"></i> Invite Bot to Server</a>
    <% } %>
    <a href="/servers" class="btn-back"><i class="fas fa-arrow-left"></i> Back to Servers</a>
</div>
