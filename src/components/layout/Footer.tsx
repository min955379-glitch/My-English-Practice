import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <p className="footer-brand">
            <Icon name="book" /> My English Practice
          </p>
          <p>Designed for calm, private practice. No scores, no competition.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/learn">Learning hub</Link>
          <Link href="/guides">Study guides</Link>
          <Link href="/planner">Weekly planner</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/help">Help & accessibility</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
      <p className="footer-note">
        British English. Your own pace. Keyboard-friendly practice, with
        optional microphone activities.
      </p>
    </footer>
  );
}
