const API = ''

async function submitComment() {
    const input = document.getElementById('commentInput')
    const text = input.value.trim()
    if (!text) return

    setLoading(true)
    showStatus('AI is analyzing your comment...', 'success')

    try {
        const res = await fetch(`${API}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        })


        if (!res.ok) throw new Error('Request failed')

        const data = await res.json()
        input.value = ''

        if (data.ticket) {
            showStatus(`Ticket created — ${data.ticket.priority} priority ${data.ticket.category} issue.`, 'success')
        } else {
            showStatus('Comment submitted — no ticket needed.', 'success')
        }

        
        await Promise.all([loadComments(), loadTickets()])
    } catch (e) {
        showStatus('Failed to submit comment. Is the server running?', 'error')
    } finally {
        setLoading(false)
    }
}

async function loadComments() {
    try {
        const res = await fetch(`${API}/comments`)
        const data = await res.json()
        const list = document.getElementById('commentList')
        const count = document.getElementById('commentCount')
        count.textContent = data.length

        if (data.length === 0) {
            list.innerHTML = '<div class="empty">NO COMMENTS YET</div>'
            return
        }

        list.innerHTML = [...data].reverse().map(c => `
            <div class="comment-item">
                <div class="comment-id">#${c.id}</div>
                <div class="comment-text">${escapeHtml(c.text)}</div>
            </div>
        `).join('')
    } catch (e) {
        console.error('Failed to load comments', e)
    }
}

async function loadTickets() {
    try {
        const res = await fetch(`${API}/tickets`)
        const data = await res.json()
        const list = document.getElementById('ticketList')
        const count = document.getElementById('ticketCount')
        count.textContent = data.length

        if (data.length === 0) {
            list.innerHTML = '<div class="empty">NO TICKETS YET</div>'
            return
        }

        list.innerHTML = [...data].reverse().map(t => `
            <div class="ticket-item">
                <div class="ticket-top">
                    <div class="ticket-title">${escapeHtml(t.title)}</div>
                    <div class="ticket-badges">
                    <span class="badge badge-category">${escapeHtml(t.category)}</span>
                    <span class="badge badge-${t.priority}">${escapeHtml(t.priority)}</span>
                    </div>
                </div>
                <div class="ticket-summary">${escapeHtml(t.summary)}</div>
                <div class="ticket-id">TICKET-${t.id}</div>
            </div>
        `).join('')
    } catch (e) {
        console.error('Failed to load tickets', e)
    }
}

function setLoading(on) {
    const btn = document.getElementById('submitBtn')
    const spinner = document.getElementById('spinner')
    const label = document.getElementById('submitLabel')
    btn.disabled = on
    spinner.style.display = on ? 'block' : 'none'
    label.textContent = on ? 'ANALYZING...' : 'SUBMIT'
}

function showStatus(msg, type) {
    const el = document.getElementById('statusMsg')
    el.textContent = msg
    el.className = 'status-msg' + (type ? ` ${type}` : '')
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

document.getElementById('commentInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitComment()
})

loadComments()
loadTickets()