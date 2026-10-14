"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
const navigation = [
  { href: "/session", label: "Practice" },
  { href: "/phonics", label: "Phonics" },
  { href: "/dashboard", label: "My progress" },
];
export function Header() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Icon name="book" width={23} height={23} />
          </span>
          <span>
            My English Practice
            <span className="brand-caption">
              A little practice. A little more confidence.
            </span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <ul>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    pathname === item.href ? "nav-link active" : "nav-link"
                  }
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ThemeToggle />
        <Link href="/profile" className="header-settings" aria-label="Settings">
          <Icon name="settings" />
        </Link>
      </div>
    </header>
  );
}
