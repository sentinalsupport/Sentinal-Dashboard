<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sentinal — Server Selection</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --pu: #7C3AED;
            --pu-l: #A855F7;
            --pu-xl: #D8B4FE;
            --pi: #D4537E;
            --pi-l: #F472B6;
            --pi-xl: #FBCFE8;
            --mg: #993556;
            --mg-l: #EC4899;
            --gold: #F59E0B;
            --gold-l: #FBBF24;
            --bg0: #0A0812;
            --bg1: #100C1C;
            --bg2: #160F26;
            --card: rgba(120, 50, 200, 0.07);
            --bord: rgba(168, 85, 247, 0.15);
            --bord2: rgba(236, 72, 153, 0.2);
            --t1: #F1F5F9;
            --t2: #C4B5D8;
            --t3: #7B6C96;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg0);
            color: var(--t1);
            min-height: 100vh;
            display: flex;
            overflow-x: hidden;
        }

        body::before {
            content: '';
            position: fixed;
            inset: 0;
            z-index: 0;
            background:
                radial-gradient(ellipse 50% 60% at 15% 50%, rgba(124,58,237,0.12) 0%, transparent 70%),
                radial-gradient(ellipse 40% 50% at 85% 20%, rgba(212,83,126,0.10) 0%, transparent 70%),
                radial-gradient(ellipse 60% 40% at 60% 80%, rgba(168,85,247,0.07) 0%, transparent 70%);
            pointer-events: none;
        }

        /* ─── Sidebar ─────────────────────────────────────────────── */
        .sb {
            width: 220px;
            min-height: 100vh;
            background: var(--bg1);
            border-right: 1px solid var(--bord);
            padding: 20px 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            position: sticky;
            top: 0;
            height: 100vh;
            z-index: 10;
            flex-shrink: 0;
        }

        .sb-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 10px;
            margin-bottom: 12px;
        }

        .sb-logo .ic {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: linear-gradient(135deg, var(--pu), var(--pi));
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 17px;
            color: #fff;
            box-shadow: 0 4px 16px rgba(124,58,237,0.4);
            flex-shrink: 0;
        }

        .sb-logo .nm {
            font-size: 17px;
            font-weight: 700;
            color: #fff;
            letter-spacing: -0.3px;
        }

        .sb-logo .bk {
            font-size: 10px;
            font-weight: 600;
            background: rgba(244,114,182,0.15);
            color: var(--pi-l);
            padding: 2px 8px;
            border-radius: 12px;
            border: 1px solid rgba(244,114,182,0.2);
        }

        .sb-nav {
            display: flex;
            flex-direction: column;
            gap: 2px;
            flex: 1;
        }

        .sb-nav a {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 12px;
            border-radius: 10px;
            color: var(--t2);
            text-decoration: none;
            font-size: 13.5px;
            font-weight: 500;
            transition: all 0.25s;
            position: relative;
            overflow: hidden;
        }

        .sb-nav a::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, rgba(124,58,237,0.12), rgba(212,83,126,0.08));
            opacity: 0;
            transition: opacity 0.25s;
            border-radius: 10px;
        }

        .sb-nav a:hover::before,
        .sb-nav a.active::before { opacity: 1; }

        .sb-nav a:hover { color: #fff; }

        .sb-nav a.active {
            color: var(--pu-xl);
            border: 1px solid rgba(168,85,247,0.2);
        }

        .sb-nav a i { font-size: 17px; flex-shrink: 0; }

        /* ─── User Dropdown ────────────────────────────────────────── */
        .sb-user {
            border-top: 1px solid var(--bord);
            padding-top: 14px;
            margin-top: auto;
            position: relative;
        }

        .sb-user .ui {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 10px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
        }

        .sb-user .ui:hover { background: var(--card); }

        .sb-user .av {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--pu), var(--pi-l));
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 13px;
            color: #fff;
            flex-shrink: 0;
        }

        .sb-user .un { font-size: 13px; font-weight: 600; color: #fff; }
        .sb-user .up { font-size: 11px; color: var(--t3); }
        .sb-user .chevron { margin-left: auto; color: var(--t3); font-size: 16px; transition: transform 0.3s; }

        /* ─── Dropdown Panel ────────────────────────────────────────── */
        .user-dropdown {
            position: absolute;
            bottom: 70px;
            left: 0;
            right: 0;
            background: var(--bg2);
            border: 1px solid var(--bord);
            border-radius: 14px;
            padding: 8px 0;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            box-shadow: 0 20px 60px rgba(0,0,0,0.6);
            z-index: 20;
        }

        .user-dropdown.open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .user-dropdown .dropdown-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 16px;
            color: var(--t2);
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s;
            cursor: pointer;
        }

        .user-dropdown .dropdown-item:hover {
            background: var(--card);
            color: #fff;
        }

        .user-dropdown .dropdown-item i { font-size: 16px; width: 20px; }

        .user-dropdown .dropdown-divider {
            height: 1px;
            background: var(--bord);
            margin: 4px 12px;
        }

        .premium-badge {
            background: linear-gradient(135deg, var(--gold), var(--gold-l));
            color: #78350F !important;
            border: none !important;
            box-shadow: 0 2px 12px rgba(245,158,11,0.3);
        }

        .premium-badge i { color: #78350F !important; }

        /* ─── Main ────────────────────────────────────────────────── */
        .main {
            flex: 1;
            padding: 28px 36px;
            position: relative;
            z-index: 1;
        }

        .ph {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 28px;
        }

        .ph h1 {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }

        .ph h1 span {
            background: linear-gradient(135deg, var(--pu-l), var(--pi-l), var(--mg-l));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }

        .ph p { color: var(--t2); font-size: 14px; margin-top: 3px; }

        .pa { display: flex; gap: 10px; align-items: center; }

        .srch {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--bg2);
            border: 1px solid var(--bord);
            border-radius: 12px;
            padding: 8px 14px;
            width: 240px;
            transition: all 0.3s;
        }

        .srch:focus-within {
            border-color: var(--pu-l);
            box-shadow: 0 0 0 3px rgba(168,85,247,0.12);
        }

        .srch input {
            background: none;
            border: none;
            color: var(--t1);
            font-size: 13.5px;
            width: 100%;
            outline: none;
            font-family: 'Inter', sans-serif;
        }

        .srch input::placeholder { color: var(--t3); }
        .srch i { color: var(--t3); font-size: 16px; }

        .btn-rf {
            background: var(--bg2);
            border: 1px solid var(--bord);
            color: var(--t2);
            padding: 8px 14px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .btn-rf:hover {
            border-color: var(--bord2);
            color: #fff;
            background: rgba(212,83,126,0.08);
        }

        .btn-rf i { font-size: 16px; }

        /* ─── Server Grid ─────────────────────────────────────────── */
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
        }

        /* ─── Server Card ─────────────────────────────────────────── */
        .sc {
            background: var(--bg1);
            border: 1px solid var(--bord);
            border-radius: 18px;
            padding: 20px 22px;
            transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            animation: fadeUp 0.4s ease both;
        }

        .sc:nth-child(1) { animation-delay: 0.05s; }
        .sc:nth-child(2) { animation-delay: 0.12s; }
        .sc:nth-child(3) { animation-delay: 0.19s; }
        .sc:nth-child(4) { animation-delay: 0.26s; }
        .sc:nth-child(5) { animation-delay: 0.33s; }
        .sc:nth-child(6) { animation-delay: 0.40s; }
        .sc:nth-child(7) { animation-delay: 0.47s; }
        .sc:nth-child(8) { animation-delay: 0.54s; }

        .sc::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(124,58,237,0.06), rgba(212,83,126,0.04));
            opacity: 0;
            transition: opacity 0.35s;
            border-radius: 18px;
        }

        .sc::after {
            content: '';
            position: absolute;
            top: -60px;
            right: -60px;
            width: 140px;
            height: 140px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%);
            opacity: 0;
            transition: all 0.35s;
        }

        .sc:hover::before,
        .sc:hover::after { opacity: 1; }

        .sc:hover {
            transform: translateY(-5px);
            border-color: rgba(168,85,247,0.35);
            box-shadow: 0 12px 40px rgba(124,58,237,0.18), 0 0 0 1px rgba(212,83,126,0.08);
        }

        .sc-head {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 10px;
        }

        .sc-ico {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--pu), var(--pi));
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
            color: #fff;
            flex-shrink: 0;
            box-shadow: 0 4px 14px rgba(124,58,237,0.3);
            transition: box-shadow 0.3s;
        }

        .sc:hover .sc-ico { box-shadow: 0 4px 20px rgba(168,85,247,0.45); }

        .sc-info .nm {
            font-size: 15px;
            font-weight: 600;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .sc-info .ow {
            font-size: 11px;
            color: var(--t3);
            margin-top: 1px;
        }

        .sc-role {
            display: inline-block;
            font-size: 10px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 10px;
            margin-top: 2px;
        }

        .sc-role.owner {
            background: rgba(245,158,11,0.15);
            color: var(--gold-l);
            border: 1px solid rgba(245,158,11,0.2);
        }

        .sc-role.admin {
            background: rgba(168,85,247,0.15);
            color: var(--pu-l);
            border: 1px solid rgba(168,85,247,0.2);
        }

        .sc-st { margin-bottom: 12px; }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-size: 11.5px;
            font-weight: 500;
            padding: 3px 10px;
            border-radius: 20px;
        }

        .badge-off {
            background: rgba(239,68,68,0.10);
            color: #FCA5A5;
            border: 1px solid rgba(239,68,68,0.2);
        }

        .badge-on {
            background: rgba(16,185,129,0.12);
            color: #34D399;
            border: 1px solid rgba(16,185,129,0.25);
        }

        .badge-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .badge-off .badge-dot { background: #FCA5A5; }
        .badge-on .badge-dot {
            background: #34D399;
            box-shadow: 0 0 6px #34D399;
            animation: pulse 2s infinite;
        }

        .sc-acts { display: flex; gap: 8px; }

        .btn-inv {
            flex: 1;
            background: linear-gradient(135deg, var(--pu), var(--pi));
            color: #fff;
            border: none;
            padding: 8px 14px;
            border-radius: 9px;
            font-size: 12.5px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.25s;
            font-family: 'Inter', sans-serif;
            position: relative;
            overflow: hidden;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .btn-inv::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, var(--pi-l), var(--mg));
            opacity: 0;
            transition: opacity 0.25s;
        }

        .btn-inv:hover::before { opacity: 1; }
        .btn-inv span { position: relative; z-index: 1; }
        .btn-inv:hover { box-shadow: 0 4px 20px rgba(212,83,126,0.35); }

        .btn-cfg {
            flex: 1;
            background: rgba(255,255,255,0.04);
            color: var(--t2);
            border: 1px solid var(--bord);
            padding: 8px 14px;
            border-radius: 9px;
            font-size: 12.5px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.25s;
            font-family: 'Inter', sans-serif;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .btn-cfg:hover {
            border-color: rgba(168,85,247,0.35);
            color: var(--pu-xl);
            background: rgba(124,58,237,0.08);
        }

        .btn-cfg a {
            color: inherit;
            text-decoration: none;
        }

        .btn-cfg.disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .btn-cfg.disabled:hover {
            border-color: var(--bord);
            color: var(--t2);
            background: transparent;
        }

        /* ─── Empty State ─────────────────────────────────────────── */
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--t2);
        }

        .empty-state i {
            font-size: 48px;
            color: var(--t3);
            margin-bottom: 16px;
            display: block;
        }

        .empty-state h3 { color: #fff; margin-bottom: 8px; }

        .hint {
            margin-top: 20px;
            font-size: 12.5px;
            color: var(--t3);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .hint i { font-size: 14px; }

        /* ─── Animations ──────────────────────────────────────────── */
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.5; }
        }

        /* ─── Responsive ──────────────────────────────────────────── */
        @media (max-width: 1024px) {
            .sb { width: 72px; padding: 16px 8px; }
            .sb-logo .nm,
            .sb-logo .bk,
            .sb-nav a span,
            .sb-user .un,
            .sb-user .up,
            .sb-user .chevron,
            .user-dropdown .dropdown-item span { display: none; }
            .sb-nav a { justify-content: center; padding: 10px; }
            .sb-user .ui { justify-content: center; }
            .user-dropdown { left: 10px; right: 10px; }
            .main { padding: 24px 20px; }
            .ph { flex-direction: column; gap: 16px; }
            .srch { width: 100%; }
            .grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 600px) {
            .sb { width: 56px; padding: 12px 6px; }
            .main { padding: 16px 12px; }
            .sc { padding: 16px; }
            .sc-acts { flex-direction: column; }
        }
    </style>
</head>
<body>

    <!-- ─── Sidebar ────────────────────────────────────────────────── -->
    <aside class="sb">
        <div class="sb-logo">
            <div class="ic">S</div>
            <span class="nm">Sentinal</span>
            <span class="bk">Free</span>
        </div>

        <nav class="sb-nav">
            <a href="#" class="active">
                <i class="ti ti-layout-dashboard" aria-hidden="true"></i>
                <span>Home</span>
            </a>
            <a href="#">
                <i class="ti ti-chart-bar" aria-hidden="true"></i>
                <span>Status</span>
            </a>
            <a href="#">
                <i class="ti ti-book" aria-hidden="true"></i>
                <span>Documentation</span>
            </a>
            <a href="#">
                <i class="ti ti-message-circle" aria-hidden="true"></i>
                <span>Support</span>
            </a>
            <a href="#">
                <i class="ti ti-star" aria-hidden="true"></i>
                <span>Premium</span>
            </a>
        </nav>

        <!-- ─── User Dropdown ──────────────────────────────────────── -->
        <div class="sb-user">
            <div class="ui" id="userToggle">
                <div class="av">U</div>
                <div>
                    <div class="un"><%= user.username %></div>
                    <div class="up">Free Plan</div>
                </div>
                <i class="ti ti-chevron-down chevron" id="chevronIcon" aria-hidden="true"></i>
            </div>

            <div class="user-dropdown" id="userDropdown">
                <a href="/profile" class="dropdown-item">
                    <i class="ti ti-user" aria-hidden="true"></i>
                    <span>Profile</span>
                </a>
                <a href="#" class="dropdown-item">
                    <i class="ti ti-settings" aria-hidden="true"></i>
                    <span>Settings</span>
                </a>
                <div class="dropdown-divider"></div>
                <a href="/premium" class="dropdown-item premium-badge">
                    <i class="ti ti-crown" aria-hidden="true"></i>
                    <span>Upgrade to Premium</span>
                </a>
                <div class="dropdown-divider"></div>
                <a href="/logout" class="dropdown-item" style="color: #F87171;">
                    <i class="ti ti-logout" aria-hidden="true"></i>
                    <span>Logout</span>
                </a>
            </div>
        </div>
    </aside>

    <!-- ─── Main Content ──────────────────────────────────────────── -->
    <main class="main">
        <div class="ph">
            <div>
                <h1>Server <span>Selection</span></h1>
                <p>Select a server you manage to configure your bot.</p>
            </div>
            <div class="pa">
                <div class="srch">
                    <i class="ti ti-search" aria-hidden="true"></i>
                    <input type="text" id="searchInput" placeholder="Search servers…" />
                </div>
                <button class="btn-rf" onclick="location.reload()">
                    <i class="ti ti-refresh" aria-hidden="true"></i> Refresh
                </button>
            </div>
        </div>

        <div class="grid" id="serverGrid">
            <% if (guilds && guilds.length > 0) { %>
                <% guilds.forEach(guild => { %>
                    <div class="sc" data-name="<%= guild.name.toLowerCase() %>">
                        <div class="sc-head">
                            <div class="sc-ico">
                                <%= guild.name.charAt(0).toUpperCase() %>
                            </div>
                            <div class="sc-info">
                                <div class="nm"><%= guild.name %></div>
                                <div class="ow">
                                    <% if (guild.hasBot) { %>
                                        <span class="badge badge-on">
                                            <span class="badge-dot"></span> Online
                                        </span>
                                    <% } else { %>
                                        <span class="badge badge-off">
                                            <span class="badge-dot"></span> Bot not installed
                                        </span>
                                    <% } %>
                                </div>
                                <% if ((guild.permissions & 0x1) === 0x1) { %>
                                    <span class="sc-role owner">👑 Owner</span>
                                <% } else if ((guild.permissions & 0x8) === 0x8) { %>
                                    <span class="sc-role admin">🛡️ Admin</span>
                                <% } %>
                            </div>
                        </div>
                        <div class="sc-acts">
                            <% if (guild.hasBot) { %>
                                <a href="/servers/<%= guild.id %>" class="btn-cfg">
                                    <i class="ti ti-settings" aria-hidden="true"></i> Configure
                                </a>
                            <% } else { %>
                                <a href="/invite/<%= guild.id %>" class="btn-inv">
                                    <span><i class="ti ti-plus" aria-hidden="true"></i> Invite Bot</span>
                                </a>
                                <span class="btn-cfg disabled">Configure</span>
                            <% } %>
                        </div>
                    </div>
                <% }) %>
            <% } else { %>
                <div class="empty-state">
                    <i class="ti ti-robot" aria-hidden="true"></i>
                    <h3>No servers found</h3>
                    <p>You don't own or have administrator permissions on any servers.</p>
                </div>
            <% } %>
        </div>

        <div class="hint">
            <i class="ti ti-shield" aria-hidden="true"></i>
            Only servers where you are the <strong>Owner</strong> or have <strong>Administrator</strong> permissions are shown.
        </div>
    </main>

    <script>
        // ─── Search ──────────────────────────────────────────────────────
        const searchInput = document.getElementById('searchInput');
        const cards = document.querySelectorAll('.sc');

        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase();
            cards.forEach(card => {
                card.style.display = card.dataset.name.includes(query) ? '' : 'none';
            });
        });

        // ─── User Dropdown Toggle ──────────────────────────────────────
        const userToggle = document.getElementById('userToggle');
        const userDropdown = document.getElementById('userDropdown');
        const chevronIcon = document.getElementById('chevronIcon');

        userToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            userDropdown.classList.toggle('open');
            chevronIcon.style.transform = userDropdown.classList.contains('open') ? 'rotate(180deg)' : '';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function () {
            userDropdown.classList.remove('open');
            chevronIcon.style.transform = '';
        });
    </script>

</body>
</html>
