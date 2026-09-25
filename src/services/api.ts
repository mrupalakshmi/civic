import type { Complaint, ComplaintInput, Role, User } from '../types'

const API_BASE = '/api'

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(errorData.message || 'Request failed')
  }

  return response.json() as Promise<T>
}

export async function loginUser(role: Role, email: string, password: string): Promise<{ user: User; token: string }> {
  return request<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role, email, password }),
  })
}

export async function fetchAuthorities(): Promise<{ authorities: Array<{ name: string; email: string; designation: string; department: string; officeName: string }> }> {
  return request<{ authorities: Array<{ name: string; email: string; designation: string; department: string; officeName: string }> }>('/authorities')
}

export async function sendChatMessage(message: string): Promise<{ reply: string }> {
  return request<{ reply: string }>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export async function fetchComplaints(): Promise<{ complaints: Complaint[] }> {
  return request<{ complaints: Complaint[] }>('/complaints')
}

export async function submitComplaint(payload: ComplaintInput): Promise<{ complaint: Complaint }> {
  return request<{ complaint: Complaint }>('/complaints', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateComplaintStatus(id: string, status: string, response?: string): Promise<{ complaint: Complaint }> {
  return request<{ complaint: Complaint }>('/complaints/' + id + '/status', {
    method: 'PATCH',
    body: JSON.stringify({ status, response }),
  })
}

export async function addCommentToComplaint(id: string, text: string): Promise<{ complaint: Complaint }> {
  return request<{ complaint: Complaint }>('/complaints/' + id + '/comment', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}
