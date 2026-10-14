"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
const navigation = [
  { href: "/session", label: "Practice" },
  { href: "/learn", label: "Explore" },
  { href: "/phonics", label: "Phonics" },
  { href: "/planner", label: "My plan" },
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
        <div className="header-controls">
          <ThemeToggle />
          <Link
            href="/profile"
            className="header-settings"
            aria-label="Settings"
          >
            <Icon name="settings" width={23} height={23} />
          </Link>
        </div>
      </div>
    </header>
  );
}
