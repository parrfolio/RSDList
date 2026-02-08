export function BuyMeCoffee() {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <p className="text-xs text-[#777] text-center">Enjoying RSD Wants? Help keep it running!</p>
      <a
        href="https://www.buymeacoffee.com/9ttv1rh"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-colors"
        style={{
          backgroundColor: '#FFDD00',
          color: '#000000',
        }}
      >
        <img
          src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
          alt=""
          className="h-5 w-5"
        />
        Buy me a coffee
      </a>
    </div>
  );
}
