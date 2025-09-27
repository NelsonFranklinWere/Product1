'use client'

import React, { useState } from 'react'
import { ContentCalendar } from '@/components/Content/ContentCalendar'
import { CreatePostModal } from '@/components/Content/CreatePostModal'
import { ProductsTable } from '@/components/Products/ProductsTable'
import apiClient from '@/lib/api'

export default function ProductsPage() {
  const [posts, setPosts] = useState([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const list = await apiClient.getProducts()
        setProducts(list as any)
      } catch {}
    }
    load()
  }, [])
  return (
    <ContentCalendar
      posts={posts as any}
      onCreatePost={() => setIsCreateOpen(true)}
      onEditPost={() => {}}
      onDeletePost={() => {}}
    />
    <div className="mt-6">
      <ProductsTable
        products={products}
        onCreate={() => {}}
        onEdit={() => {}}
        onDelete={async (id) => {
          await apiClient.deleteProduct(id)
          setProducts((prev) => prev.filter((p: any) => p.id !== id))
        }}
      />
    </div>
    <CreatePostModal
      isOpen={isCreateOpen}
      onClose={() => setIsCreateOpen(false)}
      onCreate={() => setIsCreateOpen(false)}
    />
  )
}


