export default function Footer() {
  return (
    <footer className="flex h-18 w-full sm:px-16 px-8 items-center bg-black text-white">
      <div className="flex flex-grow h-full w-full py-4 justify-end">
        <a href="https://github.com/dperdic/s2-spl-tokens" target="_blank" className="flex flex-row gap-2">
          <img src="/github-mark-white.svg" alt="vite" className="h-5 inline-block" />

          <span>Source code</span>
        </a>
      </div>
    </footer>
  );
}
