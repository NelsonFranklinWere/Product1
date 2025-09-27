import React from 'react'

export function ProductsTable({
  products,
  onCreate,
  onEdit,
  onDelete,
  onInsertToComposer,
}: {
  products: any[]
  onCreate: () => void
  onEdit: (p: any) => void
  onDelete: (id: number) => void
  onInsertToComposer?: (p: any) => void
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Products</h3>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={onCreate}>New Product</button>
      </div>
      <div className="divide-y">
        {products.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.name} • KES {p.price}</div>
              <div className="text-sm text-gray-500">{p.description}</div>
            </div>
            <div className="flex gap-2">
              {onInsertToComposer && (
                <button className="px-2 py-1 text-sm border rounded" onClick={() => onInsertToComposer(p)}>Insert to composer</button>
              )}
              <button className="px-2 py-1 text-sm border rounded" onClick={() => onEdit(p)}>Edit</button>
              <button className="px-2 py-1 text-sm border rounded text-red-600" onClick={() => onDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


