'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(`注册失败：${error.message}`)
    } else {
      alert('注册成功，请前往邮箱确认')
      router.push('/dashboard') // 可改成跳回 /login
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">注册账号</h1>
      <input
        type="email"
        className="border p-2 mb-2 w-80"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="邮箱地址"
      />
      <input
        type="password"
        className="border p-2 mb-2 w-80"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密码（至少6位）"
      />
      <button
        onClick={handleRegister}
        className="bg-green-600 text-white px-4 py-2 rounded w-80"
      >
        注册
      </button>
      <p className="mt-4 text-sm text-gray-600">
      已经有账号了？{' '}
      <Link href="/login" className="text-blue-600 hover:underline">
        账号登陆
      </Link>
    </p>
    </main>
  )
}
