'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface Task {
  id: string
  title: string
  is_done: boolean
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [adding, setAdding] = useState(false)

  const addTask = async () => {
    if (!newTaskTitle.trim()) return
  
    setAdding(true)
  
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
  
    if (userError || !user) {
      console.error('无法获取用户信息', userError?.message)
      setAdding(false)
      return
    }
  
    const { error } = await supabase.from('tasks').insert({
      title: newTaskTitle,
      user_id: user.id,
      is_done: false,
    })
  
    if (error) {
      console.error('添加任务失败:', error.message)
    } else {
      setNewTaskTitle('')
      fetchTasks() // 重新加载任务列表
    }
  
    setAdding(false)
  }

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  
    if (error) {
      console.error('删除失败:', error.message)
    } else {
      fetchTasks() // 删除成功后刷新列表
    }
  }
  
  const toggleTaskStatus = async (taskId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_done: !currentStatus })
      .eq('id', taskId)
  
    if (error) {
      console.error('状态切换失败:', error.message)
    } else {
      fetchTasks()
    }
  }
  
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('加载任务失败:', error.message)
    } else {
      setTasks(data || [])
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">你的任务面板</h1>
  
      {/* 添加任务表单 */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="输入新任务标题"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={addTask}
          disabled={adding}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {adding ? '添加中…' : '添加任务'}
        </button>
      </div>
  
      {/* 任务展示区域 */}
      {loading ? (
        <p>加载中...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">你还没有任务，快来添加吧！</p>
      ) : (
        <ul className="space-y-2 mb-8">
          {tasks.map((task) => (
            <li
            key={task.id}
            className="p-4 border rounded shadow-sm flex justify-between items-center"
          >
            <div className="flex flex-col">
              <span className="font-medium">{task.title}</span>
              <span
                onClick={() => toggleTaskStatus(task.id, task.is_done)}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    task.is_done ? 'text-green-600' : 'text-gray-400'
                }`}
                >
                {task.is_done ? '✅ 已完成' : '⬜ 未完成'}
              </span>
            </div>
          
            <button
              onClick={() => deleteTask(task.id)}
              className="ml-4 text-red-500 hover:text-red-700 text-sm"
            >
              🗑️ 删除
            </button>
          </li>          
          ))}
        </ul>
      )}
  
      {/* 退出登录 */}
      <button
        onClick={handleLogout}
        className="w-full mt-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        退出登录
      </button>
    </div>
  )
  
}
