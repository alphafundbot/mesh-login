// Strategist Cockpit Nav — Sovereign Dashboard Links
import Link from 'next/link'

export default function NavMenu() {
  return (
    <nav className="space-y-2 p-4">
      <h2 className="text-xl font-semibold">🧭 Cockpit Navigation</h2>
      <ul className="space-y-1">
        <li><Link href="/dashboard" className="hover:underline">Strategist HUD</Link></li>
        <li><Link href="/dashboard/iam" className="hover:underline">IAM Management</Link></li>
        <li><Link href="/dashboard/resources" className="hover:underline">Resource Management</Link></li>
        <li><Link href="/dashboard/audit" className="hover:underline">Audit Trail</Link></li>
        <li><Link href="/dashboard/config" className="hover:underline">Configuration</Link></li>
        <li><Link href="/dashboard/service-account" className="hover:underline">Service Account Details</Link></li>
      </ul>
    </nav>
  )
}