const Logo = () => {
  return (
    <div className="flex items-center gap-1.5 select-none">
      <span className="font-heading font-black text-2xl tracking-tight text-foreground">
        cupom
      </span>
      <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-sm shadow-amber-500/30">
        <span className="font-heading font-black text-xs text-white drop-shadow-sm">$</span>
      </div>
      <span className="font-heading text-[11px] font-bold text-primary tracking-widest uppercase bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
        da vez
      </span>
    </div>
  );
};

export default Logo;
