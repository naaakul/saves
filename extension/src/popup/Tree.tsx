import { useState } from "react"

export type CollectionNode = {
  id: string
  name: string
  children: CollectionNode[]
}

export function Tree({
  nodes,
  selectedId,
  onSelect
}: {
  nodes: CollectionNode[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <ul style={{ paddingLeft: 12 }}>
      {nodes.map(node => (
        <Node
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}

function Node({
  node,
  selectedId,
  onSelect
}: {
  node: CollectionNode
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <li>
      <div style={{ display: "flex", gap: 6 }}>
        {node.children.length > 0 && (
          <button onClick={() => setOpen(!open)}>
            {open ? "▾" : "▸"}
          </button>
        )}
        <button
          onClick={() => onSelect(node.id)}
          style={{
            fontWeight: node.id === selectedId ? "bold" : "normal"
          }}
        >
          {node.name}
        </button>
      </div>

      {open && node.children.length > 0 && (
        <Tree
          nodes={node.children}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )}
    </li>
  )
}
