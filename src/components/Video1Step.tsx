import React, {
  createElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

interface Video1StepProps {
  totalBalance?: number;
  onComplete?: () => void;
}

export type ReactionType = "like" | "love" | "care" | "wow";

export interface CommentReply {
  id: number | string;
  name: string;
  avatar?: string;
  text: string;
  likes: number;
  likedByMe?: boolean;
  isModerator?: boolean;
  isLead?: boolean;
  timeLabel?: string;
  justEntered?: boolean;
  whatsappUrl?: string;
  whatsappLabel?: string;
}

export interface ScheduledReply {
  delaySec: number;
  name: string;
  avatar: string;
  text: string;
  likes: number;
  isModerator?: boolean;
}

export interface SyncedComment {
  id: number | string;
  timestamp: number;
  name: string;
  avatar: string;
  text: string;
  likes: number;
  replies?: CommentReply[];
  scheduledReplies?: ScheduledReply[];
  isLead?: boolean;
  isModerator?: boolean;
  whatsappUrl?: string;
  whatsappLabel?: string;
  justEntered?: boolean;
  likedByMe?: boolean;
  timeLabel?: string;
}

interface FloatingReaction {
  id: number;
  type: "like" | "love" | "care";
  rightOffset: number;
  swayStart: number;
  swayMid: number;
  swayEnd: number;
}

interface AssistantQueueTask {
  id: string;
  targetParentId?: number | string;
  readDelayMs: number;
  writeDelayMs: number;
  text: string;
  whatsappUrl?: string;
  whatsappLabel?: string;
}

const PRODUCT_NAME = "Cupom da Vez";
const PAGE_NAME = "Cupom da Vez Angola";
const MODERATOR_NAME = `Assistente ${PRODUCT_NAME}`;
const WHATSAPP_NUMBER = "244923000000";

const VTURB_PLAYER_ID = "vid-6afd6dff0d3c1c3586e05d6c";
const VTURB_SCRIPT_ID = "vturb-player-6afd6dff0d3c1c3586e05d6c";
const VTURB_SCRIPT_SRC =
  "https://scripts.converteai.net/559cae8c-319d-4eeb-9ade-f4e8f12c1e74/players/6afd6dff0d3c1c3586e05d6c/v4/player.js";

/* ─── Inline Fallback for Threaded Synchronized Comments (Paced realistically) ─── */
const FALLBACK_COMMENTS: SyncedComment[] = [
  {
    id: 1,
    timestamp: 4,
    name: "Paulo Baptista",
    avatar: "images/avatars/paulo-baptista.jpg",
    text: "Boa tarde a todos! Já validei os meus 6 cupões hoje, estou a assistir com atenção para fazer o levantamento certinho.",
    likes: 24,
    replies: [],
    scheduledReplies: [
      {
        delaySec: 10,
        name: "Helena Domingos",
        avatar: "images/avatars/helena-domingos.jpg",
        text: "@Paulo Baptista também já completei os 6 aqui em Luanda! Muito fácil de fazer.",
        likes: 12,
      },
    ],
  },
  {
    id: 2,
    timestamp: 26,
    name: "Cláudia Neto",
    avatar: "images/avatars/claudia-neto.jpg",
    text: "Pessoal, depois de fazer a confirmação do cadastro no final, quanto tempo demora para o valor cair na conta?",
    likes: 19,
    replies: [],
    scheduledReplies: [
      {
        delaySec: 7,
        name: "Assistente Cupom da Vez",
        avatar: "",
        isModerator: true,
        text: "Olá @Cláudia Neto! Assim que concluir a confirmação no final do vídeo, a transferência via Multicaixa Express ou IBAN é processada de forma automática em menos de 2 minutos. ✅",
        likes: 31,
      },
      {
        delaySec: 16,
        name: "Mateus Quiala",
        avatar: "images/avatars/mateus-quiala.jpg",
        text: "@Cláudia Neto comigo foi muito rápido, nem deu tempo de fechar a página e já vibrou a notificação no telemóvel!",
        likes: 18,
      },
      {
        delaySec: 24,
        name: "Cláudia Neto",
        avatar: "images/avatars/claudia-neto.jpg",
        text: "Que óptimo, obrigada pelo esclarecimento! Vou continuar a assistir com atenção 🙏",
        likes: 9,
      },
    ],
  },
  {
    id: 3,
    timestamp: 65,
    name: "Teresa Muhongo",
    avatar: "images/avatars/teresa-muhongo.jpg",
    text: "Onde é que aparece o botão para liberar o saque? Ainda estou a ver a explicação.",
    likes: 22,
    replies: [],
    scheduledReplies: [
      {
        delaySec: 8,
        name: "Assistente Cupom da Vez",
        avatar: "",
        isModerator: true,
        text: "Olá @Teresa Muhongo! Continue a assistir ao vídeo sem sair da página. O sistema libera automaticamente o botão de levantamento assim que a explicação terminar! 👇",
        likes: 27,
      },
      {
        delaySec: 17,
        name: "Neusa Francisco",
        avatar: "images/avatars/neusa-francisco.jpg",
        text: "@Teresa Muhongo é isso mesmo, é só não fechar a página que no final abre a etapa de levantamento direto.",
        likes: 14,
      },
    ],
  },
  {
    id: 4,
    timestamp: 110,
    name: "Gaspar Ndongala",
    avatar: "images/avatars/gaspar-ndongala.jpg",
    text: "Essa verificação anti-fraude é mesmo devolvida junto com o saldo acumulado?",
    likes: 28,
    replies: [],
    scheduledReplies: [
      {
        delaySec: 8,
        name: "Assistente Cupom da Vez",
        avatar: "",
        isModerator: true,
        text: "Sim, @Gaspar Ndongala! A confirmação serve apenas para validar a titularidade da conta contra robôs e o valor retorna integralmente junto com o seu saque em Kwanzas. 🛡️",
        likes: 35,
      },
      {
        delaySec: 18,
        name: "Pedro Cassule",
        avatar: "images/avatars/pedro-cassule.jpg",
        text: "@Gaspar Ndongala sim irmão, o que é teu volta garantido junto com o saque. Fiz e correu tudo 100%.",
        likes: 21,
      },
    ],
  },
  {
    id: 5,
    timestamp: 160,
    name: "Catarina Zola",
    avatar: "images/avatars/catarina-zola.jpg",
    text: "Alguém sabe dizer se funciona com conta do Banco Sol ou Millennium Atlântico?",
    likes: 16,
    replies: [],
    scheduledReplies: [
      {
        delaySec: 8,
        name: "Assistente Cupom da Vez",
        avatar: "",
        isModerator: true,
        text: "Olá @Catarina Zola! Sim, o sistema tem integração direta com todos os bancos de Angola (BAI, BFA, BIC, Banco Sol, Millennium Atlântico, BPC) além do Multicaixa Express imediato. 🏦",
        likes: 29,
      },
      {
        delaySec: 17,
        name: "Edson Cacuaco",
        avatar: "images/avatars/edson-cacuaco.jpg",
        text: "@Catarina Zola eu recebi pelo Millennium Atlântico sem problema nenhum!",
        likes: 15,
      },
    ],
  },
  {
    id: 6,
    timestamp: 210,
    name: "Hélder Mavungo",
    avatar: "images/avatars/helder-mavungo.jpg",
    text: "Posso usar o número do Multicaixa Express mesmo se tiver registado noutro banco?",
    likes: 18,
    replies: [],
    scheduledReplies: [
      {
        delaySec: 8,
        name: "Assistente Cupom da Vez",
        avatar: "",
        isModerator: true,
        text: "Com certeza, @Hélder Mavungo! O envio via Multicaixa Express funciona para qualquer número associado à rede EMIS em Angola, com crédito instantâneo. 💳",
        likes: 24,
      },
    ],
  },
  {
    id: 7,
    timestamp: 260,
    name: "Rosaura Cambinda",
    avatar: "images/avatars/rosaura-cambinda.jpg",
    text: "Deixem o gosto na transmissão pessoal! Vale muito a pena acompanhar até ao final ❤️",
    likes: 42,
    replies: [],
  },
  {
    id: 8,
    timestamp: 310,
    name: "Nelson Sapalo",
    avatar: "images/avatars/nelson-sapalo.jpg",
    text: "Aqui no Lubango já terminámos os passos e foi tudo muito simples e transparente. Parabéns pela iniciativa!",
    likes: 33,
    replies: [],
  },
  {
    id: 9,
    timestamp: 360,
    name: "Laurinda Pinto",
    avatar: "images/avatars/laurinda-pinto.jpg",
    text: "Estou quase a terminar o vídeo para concluir o levantamento. Muito bem explicado!",
    likes: 26,
    replies: [],
  },
  {
    id: 10,
    timestamp: 410,
    name: "Valdemar Chivukuvuku",
    avatar: "images/avatars/valdemar-chivukuvuku.jpg",
    text: "Quem ainda está a assistir não feche a página antes do fim! Vale a pena assistir cada minuto para fazer tudo certinho.",
    likes: 38,
    replies: [],
  },
];

/* ─── Deterministic Avatar Color & Initials Helpers ─── */
const AVATAR_COLORS = [
  "#1877F2",
  "#E41E3F",
  "#2ABBA7",
  "#F5533D",
  "#8B5CF6",
  "#0D9488",
  "#D97706",
  "#2563EB",
  "#DB2777",
  "#059669",
];

export const slugifyName = (name: string): string =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const normalizeText = (str: string): string =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const randomBetween = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/* ============================================================
   OFFICIAL FACEBOOK SVG REACTION BADGES
   ============================================================ */

export const FbLikeBadgeSvg: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = "",
}) => {
  const uid = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Gosto"
    >
      <defs>
        <linearGradient id={`fb-like-grad-${uid}`} x1="18" y1="0" x2="18" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#378FE9" />
          <stop offset="100%" stopColor="#1877F2" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="18" fill={`url(#fb-like-grad-${uid})`} />
      <path
        d="M11.2 16.2H8.8C8.14 16.2 7.6 16.74 7.6 17.4V26.4C7.6 27.06 8.14 27.6 8.8 27.6H11.2C11.86 27.6 12.4 27.06 12.4 26.4V17.4C12.4 16.74 11.86 16.2 11.2 16.2ZM26.65 16.05H20.85C21.52 13.72 21.85 11.75 21.85 10.6C21.85 8.85 20.65 7.6 19.2 7.6C18.35 7.6 17.65 8.1 17.35 8.95L14.65 15.85C14.3 16.65 13.8 17.2 13.8 18.0V25.6C13.8 26.7 14.7 27.6 15.8 27.6H24.35C25.55 27.6 26.55 26.8 26.8 25.65L28.45 18.45C28.75 17.15 27.85 16.05 26.65 16.05Z"
        fill="#FFFFFF"
      />
    </svg>
  );
};

export const FbLoveBadgeSvg: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = "",
}) => {
  const uid = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Adoro"
    >
      <defs>
        <linearGradient id={`fb-love-grad-${uid}`} x1="18" y1="0" x2="18" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF5A79" />
          <stop offset="100%" stopColor="#E41E3F" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="18" fill={`url(#fb-love-grad-${uid})`} />
      <path
        d="M23.15 9.75C20.9 9.75 19.02 10.98 18 12.68C16.98 10.98 15.1 9.75 12.85 9.75C9.62 9.75 7.2 12.32 7.2 15.65C7.2 21.35 14.85 25.82 17.38 27.42C17.76 27.66 18.24 27.66 18.62 27.42C21.15 25.82 28.8 21.35 28.8 15.65C28.8 12.32 26.38 9.75 23.15 9.75Z"
        fill="#FFFFFF"
      />
    </svg>
  );
};

export const FbCareBadgeSvg: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = "",
}) => {
  const uid = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Força"
    >
      <defs>
        <radialGradient id={`fb-care-grad-${uid}`} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFE17D" />
          <stop offset="70%" stopColor="#F7B125" />
          <stop offset="100%" stopColor="#E69500" />
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="18" fill={`url(#fb-care-grad-${uid})`} />
      <ellipse cx="12.5" cy="13.2" rx="1.75" ry="2.2" fill="#4B2E05" />
      <ellipse cx="23.5" cy="13.2" rx="1.75" ry="2.2" fill="#4B2E05" />
      <path d="M9.8 10.2C11 9.1 13.2 9.1 14.5 10" stroke="#4B2E05" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M26.2 10.2C25 9.1 22.8 9.1 21.5 10" stroke="#4B2E05" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14.5 17.2C16.2 18.6 19.8 18.6 21.5 17.2" stroke="#4B2E05" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M21.4 19.8C20.1 19.8 19.05 20.52 18.45 21.5C17.85 20.52 16.8 19.8 15.5 19.8C13.65 19.8 12.25 21.25 12.25 23.15C12.25 26.4 16.65 28.95 18.1 29.85C18.32 29.98 18.58 29.98 18.8 29.85C20.25 28.95 24.65 26.4 24.65 23.15C24.65 21.25 23.25 19.8 21.4 19.8Z"
        fill="#E41E3F"
      />
      <path
        d="M8.5 21.5C10.2 23.8 13.2 25.2 15.8 24.6"
        stroke="#D48400"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M27.5 21.5C25.8 23.8 22.8 25.2 20.2 24.6"
        stroke="#D48400"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const FbWowBadgeSvg: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = "",
}) => {
  const uid = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Uau"
    >
      <defs>
        <radialGradient id={`fb-wow-grad-${uid}`} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFE17D" />
          <stop offset="70%" stopColor="#F7B125" />
          <stop offset="100%" stopColor="#E69500" />
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="18" fill={`url(#fb-wow-grad-${uid})`} />
      <path d="M9.6 10.2C11.1 8.4 13.6 8.4 15 10" stroke="#4B2E05" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M26.4 10.2C24.9 8.4 22.4 8.4 21 10" stroke="#4B2E05" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="12.6" cy="14.2" rx="2.1" ry="2.7" fill="#4B2E05" />
      <ellipse cx="23.4" cy="14.2" rx="2.1" ry="2.7" fill="#4B2E05" />
      <ellipse cx="18" cy="24.2" rx="4.2" ry="5.6" fill="#4B2E05" />
    </svg>
  );
};

/* ─── Official Facebook Blue Verified Badge SVG ─── */
const FbVerifiedBadgeSvg: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block shrink-0 align-text-bottom"
    aria-label="Verificado"
  >
    <path
      d="M12 1.5L14.84 3.63L18.36 3.24L19.56 6.59L22.76 8.33L21.95 11.79L23.76 14.86L21.14 17.27L21.08 20.82L17.64 21.7L15.27 24.35L12 22.92L8.73 24.35L6.36 21.7L2.92 20.82L2.86 17.27L0.24 14.86L2.05 11.79L1.24 8.33L4.44 6.59L5.64 3.24L9.16 3.63L12 1.5Z"
      fill="#1877F2"
    />
    <path
      d="M9.95 16.4L6.45 12.9L7.86 11.49L9.95 13.58L16.14 7.39L17.55 8.8L9.95 16.4Z"
      fill="#FFFFFF"
    />
  </svg>
);

/* ─── Official Page Avatar ─── */
const PageOfficialAvatar: React.FC<{
  size?: number;
  withLiveRing?: boolean;
  withOnlineDot?: boolean;
}> = ({ size = 40, withLiveRing = false, withOnlineDot = false }) => (
  <div
    className="relative shrink-0 inline-flex items-center justify-center rounded-full select-none"
    style={{
      width: size,
      height: size,
      padding: withLiveRing ? 2 : 0,
      border: withLiveRing ? "2px solid #E41E3F" : "none",
    }}
  >
    <div
      className="w-full h-full rounded-full flex items-center justify-center overflow-hidden shadow-inner"
      style={{
        background: "linear-gradient(135deg, #1877F2 0%, #0A47A9 100%)",
      }}
    >
      <svg
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="3" y="7" width="26" height="18" rx="4" fill="#F7B125" />
        <circle cx="3" cy="16" r="2.6" fill="#0E56C8" />
        <circle cx="29" cy="16" r="2.6" fill="#0E56C8" />
        <path
          d="M16 10.5V21.5M18.6 13.2C18.6 11.98 17.44 11 16 11C14.56 11 13.4 11.98 13.4 13.2C13.4 14.42 14.56 15.1 16 15.6C17.44 16.1 18.6 16.78 18.6 18.1C18.6 19.42 17.44 20.4 16 20.4C14.56 20.4 13.4 19.42 13.4 18.1"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </div>

    {withLiveRing && (
      <span
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#E41E3F] text-white font-bold uppercase tracking-wider rounded px-1 leading-tight border border-white"
        style={{ fontSize: "8px" }}
      >
        DIRETO
      </span>
    )}

    {withOnlineDot && (
      <span
        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#31A24C] border-2 border-white"
        title="Online agora"
      />
    )}
  </div>
);

/* ─── Resilient User Avatar with Real Photo + Deterministic Initials Fallback ─── */
const UserAvatarWithFallback: React.FC<{
  name: string;
  avatarPath?: string;
  size?: number;
  showOnlineDot?: boolean;
}> = ({ name, avatarPath, size = 34, showOnlineDot = false }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const slug = slugifyName(name);
  const resolvedSrc = useMemo(() => {
    const raw = avatarPath || `images/avatars/${slug}.jpg`;
    const path = raw.startsWith("/") ? raw : `/${raw}`;
    return `${path}?v=2`;
  }, [avatarPath, slug]);

  useEffect(() => {
    setImgFailed(false);
  }, [resolvedSrc]);

  const bgColor = useMemo(() => getAvatarColor(name), [name]);
  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <div
      className="relative shrink-0 rounded-full select-none"
      style={{ width: size, height: size }}
    >
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-bold text-white uppercase tracking-tight overflow-hidden border border-black/5"
        style={{
          backgroundColor: bgColor,
          fontSize: Math.max(10, Math.round(size * 0.38)),
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {initials}
      </div>

      {!imgFailed && (
        <img
          src={resolvedSrc}
          alt={name}
          loading="eager"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            setImgFailed(true);
          }}
          className="absolute inset-0 w-full h-full rounded-full object-cover border border-black/10"
        />
      )}

      {showOnlineDot && (
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#31A24C] border-2 border-white"
          aria-hidden
        />
      )}
    </div>
  );
};

/* ============================================================
   MAIN COMPONENT: FACEBOOK LIVE MOBILE VSL WITH THREADS
   ============================================================ */

const Video1Step: React.FC<Video1StepProps> = ({ totalBalance = 101500 }) => {
  /* ─── 1. Lead Identity from Funnel ─── */
  const leadFullName = useMemo(() => {
    if (typeof window === "undefined") return "Visitante";
    const stored =
      localStorage.getItem("userName") ||
      localStorage.getItem("name") ||
      localStorage.getItem("leadName") ||
      "Cliente";
    return stored.trim() || "Cliente";
  }, []);

  const firstName = useMemo(() => {
    return leadFullName.split(/\s+/)[0] || "Cliente";
  }, [leadFullName]);

  const isRepriseMode = useMemo(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("mode")?.toLowerCase() === "reprise";
  }, []);

  /* ─── 2. Audience Counter (1.584 -> oscillates smoothly every 2.8s between 1.500 and 1.700) ─── */
  const [viewerCount, setViewerCount] = useState<number>(1584);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => {
        const delta = randomBetween(-10, 12);
        const next = prev + delta;
        return Math.max(1500, Math.min(1700, next));
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  /* ─── 3. Stats & Reactions Bar State ─── */
  const [reactionCount, setReactionCount] = useState<number>(1248);
  const [commentsCount, setCommentsCount] = useState<number>(386);
  const [sharesCount, setSharesCount] = useState<number>(94);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [showReactionTray, setShowReactionTray] = useState<boolean>(false);
  const longPressTimerRef = useRef<number | null>(null);

  /* ─── 4. Floating SVG Reactions Stream ─── */
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const floatingIdRef = useRef<number>(1);

  const spawnFloatingReaction = useCallback((forcedType?: "like" | "love" | "care") => {
    const types: ("like" | "love" | "care")[] = ["like", "love", "care"];
    const chosen = forcedType || types[Math.floor(Math.random() * types.length)];
    const id = floatingIdRef.current++;
    const newReaction: FloatingReaction = {
      id,
      type: chosen,
      rightOffset: randomBetween(10, 44),
      swayStart: randomBetween(-14, 14),
      swayMid: randomBetween(-18, 18),
      swayEnd: randomBetween(-12, 12),
    };
    setFloatingReactions((prev) => [...prev.slice(-14), newReaction]);
    window.setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2650);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      spawnFloatingReaction();
    }, 1800);
    return () => clearInterval(interval);
  }, [spawnFloatingReaction]);

  /* ─── 5. Load Vturb SmartPlayer Script ─── */
  useEffect(() => {
    if (document.getElementById(VTURB_SCRIPT_ID)) return;
    const s = document.createElement("script");
    s.id = VTURB_SCRIPT_ID;
    s.src = VTURB_SCRIPT_SRC;
    s.async = true;
    document.head.appendChild(s);
  }, []);

  /* ─── 6. Load comments.json & Control Pace ─── */
  const [allScriptedComments, setAllScriptedComments] =
    useState<SyncedComment[]>(FALLBACK_COMMENTS);
  const [visibleComments, setVisibleComments] = useState<SyncedComment[]>([]);
  const releasedIdsRef = useRef<Set<number | string>>(new Set());
  const fallbackElapsedRef = useRef<number>(0);

  useEffect(() => {
    let active = true;
    fetch("/comments.json")
      .then((res) => {
        if (!res.ok) throw new Error("Fallback");
        return res.json();
      })
      .then((data: SyncedComment[]) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setAllScriptedComments(data);
        }
      })
      .catch(() => {
        /* FALLBACK_COMMENTS used */
      });
    return () => {
      active = false;
    };
  }, []);

  /* ─── 7. Humanized Sequential Moderator Queue (Threads Aware) ─── */
  const assistantQueueRef = useRef<AssistantQueueTask[]>([]);
  const isProcessingQueueRef = useRef<boolean>(false);
  const [typingParentId, setTypingParentId] = useState<number | string | null>(null);
  const [isModeratorTypingGeneral, setIsModeratorTypingGeneral] = useState<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const processAssistantQueue = useCallback(() => {
    if (isProcessingQueueRef.current) return;
    const nextTask = assistantQueueRef.current.shift();
    if (!nextTask) return;

    isProcessingQueueRef.current = true;

    // 1st Delay: Reading / Perception Time
    window.setTimeout(() => {
      if (!mountedRef.current) return;

      if (nextTask.targetParentId) {
        setTypingParentId(nextTask.targetParentId);
      } else {
        setIsModeratorTypingGeneral(true);
      }

      // 2nd Delay: Typing Indicator
      window.setTimeout(() => {
        if (!mountedRef.current) return;
        setTypingParentId(null);
        setIsModeratorTypingGeneral(false);

        if (nextTask.targetParentId) {
          // Add as nested thread reply to the specific parent comment
          const newReply: CommentReply = {
            id: `rep-mod-${Date.now()}`,
            name: MODERATOR_NAME,
            avatar: "",
            text: nextTask.text,
            likes: 1,
            isModerator: true,
            whatsappUrl: nextTask.whatsappUrl,
            whatsappLabel: nextTask.whatsappLabel,
            justEntered: true,
            timeLabel: "Agora mesmo",
          };

          setVisibleComments((prev) =>
            prev.map((c) =>
              c.id === nextTask.targetParentId
                ? { ...c, replies: [...(c.replies || []), newReply] }
                : c
            )
          );
        } else {
          // General welcome comment
          const modComment: SyncedComment = {
            id: `mod-root-${Date.now()}`,
            timestamp: fallbackElapsedRef.current,
            name: MODERATOR_NAME,
            avatar: "",
            text: nextTask.text,
            likes: 2,
            isModerator: true,
            justEntered: true,
            timeLabel: "Agora mesmo",
            replies: [],
          };
          setVisibleComments((prev) => [modComment, ...prev]);
        }

        setCommentsCount((c) => c + 1);

        window.setTimeout(() => {
          isProcessingQueueRef.current = false;
          processAssistantQueue();
        }, 600);
      }, nextTask.writeDelayMs);
    }, nextTask.readDelayMs);
  }, []);

  const enqueueModeratorMessage = useCallback(
    (task: Omit<AssistantQueueTask, "id">) => {
      assistantQueueRef.current.push({
        ...task,
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      });
      processAssistantQueue();
    },
    [processAssistantQueue]
  );

  /* Initial greeting after natural delay */
  useEffect(() => {
    const initialWait = randomBetween(8000, 12000);
    const timer = window.setTimeout(() => {
      enqueueModeratorMessage({
        readDelayMs: 400,
        writeDelayMs: randomBetween(3200, 4200),
        text: `Olá @${firstName}! 👋 Bem-vindo(a) à transmissão oficial do ${PRODUCT_NAME} Angola. Assista ao vídeo com atenção para concluir a sua verificação. Qualquer dúvida pode colocar aqui no chat!`,
      });
    }, initialWait);

    return () => clearTimeout(timer);
  }, [enqueueModeratorMessage, firstName]);

  /* ─── Paced Synchronization: 1s real clock increment ─── */
  useEffect(() => {
    const tick = window.setInterval(() => {
      fallbackElapsedRef.current += 1;

      // Check Vturb SmartPlayer time if available
      const win = window as unknown as {
        smartplayer?: {
          instances?: Array<{
            video?: { currentTime?: number };
          }>;
        };
      };

      let vturbTime: number | undefined =
        win.smartplayer?.instances?.[0]?.video?.currentTime;

      if (typeof vturbTime !== "number" || Number.isNaN(vturbTime)) {
        const container = document.getElementById(VTURB_PLAYER_ID);
        const internalVideo = container?.querySelector("video");
        if (internalVideo && typeof internalVideo.currentTime === "number") {
          vturbTime = internalVideo.currentTime;
        }
      }

      const effectiveTime =
        typeof vturbTime === "number" && vturbTime > 0
          ? Math.max(vturbTime, fallbackElapsedRef.current)
          : fallbackElapsedRef.current;

      allScriptedComments.forEach((comment) => {
        if (
          comment.timestamp <= effectiveTime &&
          !releasedIdsRef.current.has(comment.id)
        ) {
          releasedIdsRef.current.add(comment.id);

          const enteringComment: SyncedComment = {
            ...comment,
            replies: comment.replies || [],
            justEntered: true,
            timeLabel: "Agora mesmo",
          };

          setVisibleComments((prev) => [enteringComment, ...prev]);
          setCommentsCount((c) => c + 1);
          setReactionCount((r) => r + randomBetween(0, 2));

          // Schedule nested conversation replies for this specific parent comment
          if (comment.scheduledReplies && comment.scheduledReplies.length > 0) {
            comment.scheduledReplies.forEach((sr) => {
              window.setTimeout(() => {
                if (!mountedRef.current) return;
                const newNestedReply: CommentReply = {
                  id: `rep-${comment.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  name: sr.name,
                  avatar: sr.avatar,
                  text: sr.text,
                  likes: sr.likes || 1,
                  isModerator: Boolean(sr.isModerator),
                  timeLabel: "Agora mesmo",
                  justEntered: true,
                };

                setVisibleComments((prev) =>
                  prev.map((c) =>
                    c.id === comment.id
                      ? { ...c, replies: [...(c.replies || []), newNestedReply] }
                      : c
                  )
                );
                setCommentsCount((c) => c + 1);
              }, sr.delaySec * 1000);
            });
          }
        }
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [allScriptedComments]);

  /* ─── 8. Lead Comments & Threaded Replying ─── */
  const [composerText, setComposerText] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<{ id: number | string; name: string } | null>(null);
  const leadInteractionCountRef = useRef<number>(0);
  const composerInputRef = useRef<HTMLInputElement>(null);

  const buildContextualModeratorReply = useCallback(
    (rawMessage: string): string => {
      const msg = normalizeText(rawMessage);

      if (
        /(preco|valor|taxa|custa|quanto|pagar|pagamento da taxa|5000|5\.000|kwanza|kz|desconto|condicao)/.test(
          msg
        )
      ) {
        return `@${firstName}, as instruções completas de validação são apresentadas no final do vídeo! O valor de confirmação serve para validar a sua titularidade bancária e retorna junto com o levantamento de ${totalBalance.toLocaleString()} Kz. ✅`;
      }

      if (
        /(funciona|como|saque|sacar|levantar|levantamento|botao|liberar|liberacao|receber|onde|aparece|demora|tempo|prazo|quando)/.test(
          msg
        )
      ) {
        return `@${firstName}, a libertação do saque é automática! Assim que concluir a explicação detalhada no vídeo, o botão fica disponível para confirmar os dados da sua conta em menos de 2 minutos. 👇`;
      }

      if (
        /(seguro|seguranca|garantia|confiavel|confiar|verdade|real|burla|golpe|medo|certeza|oficial|protecao|fraude)/.test(
          msg
        )
      ) {
        return `@${firstName}, pode acompanhar com tranquilidade! Esta é a transmissão oficial do ${PRODUCT_NAME} Angola com protocolo de segurança bancária. 🛡️🇦🇴`;
      }

      if (
        /(multicaixa|express|iban|banco|bai|bfa|bic|atlantico|sol|bpc|keve|referencia|emis|conta|metodo|transferencia)/.test(
          msg
        )
      ) {
        return `@${firstName}, temos suporte para os principais métodos bancários em Angola: Multicaixa Express imediato e IBAN para os bancos BAI, BFA, BIC, Atlântico, Banco Sol e BPC. 🏦💳`;
      }

      const warmReplies = [
        `Excelente participação, @${firstName}! 🙌 Continue a acompanhar o vídeo até ao final para realizar a sua confirmação sem dúvidas.`,
        `Muito obrigado pela pergunta, @${firstName}! 😊 Estamos aqui para apoiar todo o processo. Assista até ao último segundo!`,
        `É isso mesmo, @${firstName}! 🇦🇴 No final da apresentação o acesso ao levantamento fica liberado de imediato.`,
      ];
      return warmReplies[Math.floor(Math.random() * warmReplies.length)];
    },
    [firstName, totalBalance]
  );

  const handleSendLeadComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = composerText.trim();
    if (!trimmed) return;

    leadInteractionCountRef.current += 1;
    const currentInteraction = leadInteractionCountRef.current;
    const replyAnswer = buildContextualModeratorReply(trimmed);

    if (replyingTo) {
      // Send as reply inside the parent thread
      const targetParentId = replyingTo.id;
      const newLeadReply: CommentReply = {
        id: `lead-rep-${Date.now()}`,
        name: leadFullName,
        avatar: "",
        text: trimmed,
        likes: 1,
        isLead: true,
        justEntered: true,
        timeLabel: "Agora mesmo",
      };

      setVisibleComments((prev) =>
        prev.map((c) =>
          c.id === targetParentId
            ? { ...c, replies: [...(c.replies || []), newLeadReply] }
            : c
        )
      );
      setCommentsCount((c) => c + 1);
      setComposerText("");
      setReplyingTo(null);

      // Enqueue Moderator reply inside THIS thread
      enqueueModeratorMessage({
        targetParentId,
        readDelayMs: randomBetween(4200, 5800),
        writeDelayMs: randomBetween(3200, 4500),
        text: replyAnswer,
      });

      if (currentInteraction === 2) {
        const prefilledText = encodeURIComponent(
          `Olá! Sou ${leadFullName}, estou na Live Oficial do ${PRODUCT_NAME} e gostaria de suporte para concluir o meu levantamento de Kz ${totalBalance.toLocaleString()}.`
        );
        enqueueModeratorMessage({
          targetParentId,
          readDelayMs: 4800,
          writeDelayMs: 3600,
          text: `@${firstName}, se precisar de acompanhamento direto para concluir o seu levantamento de ${totalBalance.toLocaleString()} Kz, toque no botão abaixo para falar com o Suporte Oficial:`,
          whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${prefilledText}`,
          whatsappLabel: "Falar com Suporte Oficial no WhatsApp",
        });
      }
    } else {
      // Send as new parent comment
      const newParentId = `lead-${Date.now()}`;
      const newLeadComment: SyncedComment = {
        id: newParentId,
        timestamp: fallbackElapsedRef.current,
        name: leadFullName,
        avatar: "",
        text: trimmed,
        likes: 1,
        isLead: true,
        justEntered: true,
        timeLabel: "Agora mesmo",
        replies: [],
      };

      setVisibleComments((prev) => [newLeadComment, ...prev]);
      setCommentsCount((c) => c + 1);
      setComposerText("");

      // Enqueue Moderator reply inside THIS new comment's thread
      enqueueModeratorMessage({
        targetParentId: newParentId,
        readDelayMs: randomBetween(4200, 5800),
        writeDelayMs: randomBetween(3200, 4500),
        text: replyAnswer,
      });

      if (currentInteraction === 2) {
        const prefilledText = encodeURIComponent(
          `Olá! Sou ${leadFullName}, estou na Live Oficial do ${PRODUCT_NAME} e gostaria de suporte para concluir o meu levantamento de Kz ${totalBalance.toLocaleString()}.`
        );
        enqueueModeratorMessage({
          targetParentId: newParentId,
          readDelayMs: 4800,
          writeDelayMs: 3600,
          text: `@${firstName}, se precisar de acompanhamento direto para concluir o seu levantamento de ${totalBalance.toLocaleString()} Kz, toque no botão abaixo para falar com o Suporte Oficial:`,
          whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${prefilledText}`,
          whatsappLabel: "Falar com Suporte Oficial no WhatsApp",
        });
      }
    }
  };

  const handleStartReply = (parentId: number | string, authorName: string) => {
    setReplyingTo({ id: parentId, name: authorName });
    setComposerText(`@${authorName.split(" ")[0]} `);
    composerInputRef.current?.focus();
    composerInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  /* ─── 9. Action Bar Handlers ─── */
  const handleSelectReaction = (type: ReactionType) => {
    if (!userReaction) {
      setReactionCount((r) => r + 1);
    }
    setUserReaction(type);
    setShowReactionTray(false);

    const floatingType: "like" | "love" | "care" =
      type === "wow" ? "care" : type;
    spawnFloatingReaction(floatingType);
    window.setTimeout(() => spawnFloatingReaction(floatingType), 180);
  };

  const handleMainLikeButtonClick = () => {
    if (!userReaction) {
      handleSelectReaction("like");
    } else {
      setShowReactionTray((prev) => !prev);
    }
  };

  const handleLikeButtonPointerDown = () => {
    longPressTimerRef.current = window.setTimeout(() => {
      setShowReactionTray(true);
    }, 380);
  };

  const handleLikeButtonPointerUpOrLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleShareClick = async () => {
    setSharesCount((s) => s + 1);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${PAGE_NAME} - Em Direto`,
          text: `Assista à transmissão oficial do ${PRODUCT_NAME} Angola!`,
          url: window.location.href,
        });
      } catch {
        /* User cancelled */
      }
    }
  };

  const toggleCommentLike = (commentId: number | string) => {
    setVisibleComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const liked = !c.likedByMe;
        return {
          ...c,
          likedByMe: liked,
          likes: liked ? c.likes + 1 : Math.max(0, c.likes - 1),
        };
      })
    );
  };

  const toggleReplyLike = (parentId: number | string, replyId: number | string) => {
    setVisibleComments((prev) =>
      prev.map((c) => {
        if (c.id !== parentId) return c;
        return {
          ...c,
          replies: (c.replies || []).map((r) => {
            if (r.id !== replyId) return r;
            const liked = !r.likedByMe;
            return {
              ...r,
              likedByMe: liked,
              likes: liked ? r.likes + 1 : Math.max(0, r.likes - 1),
            };
          }),
        };
      })
    );
  };

  const renderCommentText = (text: string) => {
    const parts = text.split(/(@[A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("@")) {
        return (
          <span key={idx} className="text-[#1877F2] font-semibold">
            {part}
          </span>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const reactionButtonMeta = useMemo(() => {
    switch (userReaction) {
      case "like":
        return { label: "Gosto", color: "#1877F2", icon: <FbLikeBadgeSvg size={20} /> };
      case "love":
        return { label: "Adoro", color: "#E41E3F", icon: <FbLoveBadgeSvg size={20} /> };
      case "care":
        return { label: "Força", color: "#F7B125", icon: <FbCareBadgeSvg size={20} /> };
      case "wow":
        return { label: "Uau", color: "#F7B125", icon: <FbWowBadgeSvg size={20} /> };
      default:
        return null;
    }
  }, [userReaction]);

  return (
    <div
      className="min-h-screen bg-[#F0F2F5] text-[#050505] pb-24 select-none sm:select-auto"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* ─── 1. TOPBAR FACEBOOK ─── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#DADDE1] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="max-w-[520px] mx-auto px-3.5 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="font-extrabold tracking-[-0.04em] text-[#1877F2] leading-none"
              style={{
                fontSize: "25px",
                fontFamily:
                  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              }}
            >
              facebook
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-full px-2.5 py-1 text-xs font-semibold text-[#050505] max-w-[150px] truncate"
              title={`Conectado como ${leadFullName}`}
            >
              <span className="w-2 h-2 rounded-full bg-[#31A24C] shrink-0" />
              <span className="truncate">{firstName}</span>
            </div>

            <button
              type="button"
              onClick={() => composerInputRef.current?.focus()}
              aria-label="Pesquisar"
              className="w-9 h-9 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] active:scale-95 flex items-center justify-center text-[#050505] transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#050505" strokeWidth="2.2" />
                <path d="M20 20L16.35 16.35" stroke="#050505" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setShowReactionTray((prev) => !prev)}
              aria-label="Menu"
              className="w-9 h-9 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] active:scale-95 flex items-center justify-center text-[#050505] transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 7H20M4 12H20M4 17H20" stroke="#050505" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN FEED COLUMN ─── */}
      <main className="max-w-[520px] mx-auto bg-white shadow-sm min-h-[calc(100vh-3rem)]">
        {/* Post Authority Header */}
        <div className="px-3.5 pt-3 pb-2.5 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <PageOfficialAvatar size={42} withLiveRing />

            <div className="leading-snug">
              <div className="flex flex-wrap items-center gap-1 text-[15px]">
                <span className="font-bold text-[#050505]">{PAGE_NAME}</span>
                <FbVerifiedBadgeSvg size={15} />
                <span className="text-[#65676B] font-normal text-[14px]">
                  está em direto
                </span>
              </div>

              <div className="flex items-center gap-1 text-[12px] text-[#65676B] mt-0.5">
                <span>Agora mesmo</span>
                <span>·</span>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="#65676B" aria-label="Público">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm4.9 6h-2.15a11.6 11.6 0 00-.82-3.56A5.52 5.52 0 0112.9 7zM8 2.5c.68 0 1.48 1.54 1.82 4.5H6.18C6.52 4.04 7.32 2.5 8 2.5zM6.07 3.44A11.6 11.6 0 005.25 7H3.1a5.52 5.52 0 012.97-3.56zM2.5 8c0-.17.01-.34.03-.5h2.58c-.04.33-.06.66-.06 1s.02.67.06 1H2.53A5.5 5.5 0 012.5 8zm.6 2.5h2.15c.18 1.32.47 2.54.82 3.56A5.52 5.52 0 013.1 10.5zM8 13.5c-.68 0-1.48-1.54-1.82-4.5h3.64c-.34 2.96-1.14 4.5-1.82 4.5zm1.93-.94c.35-1.02.64-2.24.82-3.56h2.15a5.52 5.52 0 01-2.97 3.56zM10.95 9.5c.04-.33.06-.66.06-1s-.02-.67-.06-1h2.52c.02.16.03.33.03.5s-.01.34-.03.5h-2.52z" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Mais opções da publicação"
            className="w-8 h-8 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center text-[#65676B]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#65676B">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>

        {/* Post Caption */}
        <div className="px-3.5 pb-2.5 text-[14px] leading-snug text-[#050505]">
          <span className="font-semibold text-[#E41E3F]">🔴 EM DIRETO:</span>{" "}
          Assista à apresentação até ao final para entender o funcionamento e
          libertar o seu saque de{" "}
          <span className="font-bold text-[#1877F2]">
            Kz {totalBalance.toLocaleString()}
          </span>{" "}
          via Multicaixa Express ou IBAN Bancário.
        </div>

        {/* Player Container */}
        <div className="relative w-full bg-black overflow-hidden">
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
            {isRepriseMode ? (
              <div className="flex items-center gap-1.5 bg-[#E41E3F] text-white font-bold text-[11px] tracking-wide uppercase px-2.5 py-1 rounded-[4px] shadow">
                <span>REPRISE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-[#E41E3F] text-white font-bold text-[11px] tracking-wide uppercase px-2.5 py-1 rounded-[4px] shadow">
                <span className="w-2 h-2 rounded-full bg-white animate-fb-live-dot" />
                <span>EM DIRETO</span>
              </div>
            )}

            <div
              className="flex items-center gap-1.5 text-white font-semibold text-[12px] px-2.5 py-1 rounded-[4px] tabular-nums"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.62)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1.5 12C3.7 7.3 7.5 4.5 12 4.5C16.5 4.5 20.3 7.3 22.5 12C20.3 16.7 16.5 19.5 12 19.5C7.5 19.5 3.7 16.7 1.5 12Z"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3.2" fill="#FFFFFF" />
              </svg>
              <span>{viewerCount.toLocaleString("pt-PT")}</span>
            </div>
          </div>

          <div className="absolute bottom-4 right-2 z-20 w-20 h-52 pointer-events-none overflow-hidden" aria-hidden>
            {floatingReactions.map((item) => (
              <div
                key={item.id}
                className="absolute bottom-0 animate-fb-float-reaction"
                style={
                  {
                    right: `${item.rightOffset}px`,
                    "--sway-start": `${item.swayStart}px`,
                    "--sway-mid": `${item.swayMid}px`,
                    "--sway-end": `${item.swayEnd}px`,
                  } as React.CSSProperties
                }
              >
                {item.type === "like" && <FbLikeBadgeSvg size={28} />}
                {item.type === "love" && <FbLoveBadgeSvg size={28} />}
                {item.type === "care" && <FbCareBadgeSvg size={28} />}
              </div>
            ))}
          </div>

          <div className="w-full">
            {createElement(
              "vturb-smartplayer",
              {
                id: VTURB_PLAYER_ID,
                style: { display: "block", margin: "0 auto", width: "100%" },
              },
              <div
                className="vturb-player-placeholder"
                style={{
                  position: "relative",
                  width: "100%",
                  padding: "56.25% 0 0",
                  zIndex: 0,
                  backgroundColor: "black",
                }}
              />
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-3.5 py-2.5 flex items-center justify-between text-[13px] text-[#65676B] border-b border-[#CED0D4]/60">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center -space-x-1">
              <span className="inline-flex rounded-full ring-[1.5px] ring-white z-20">
                <FbLikeBadgeSvg size={18} />
              </span>
              <span className="inline-flex rounded-full ring-[1.5px] ring-white z-10">
                <FbLoveBadgeSvg size={18} />
              </span>
            </div>
            <span className="tabular-nums text-[#65676B]">
              {reactionCount.toLocaleString("pt-PT")}
            </span>
          </div>

          <div className="flex items-center gap-2 tabular-nums">
            <span>{commentsCount.toLocaleString("pt-PT")} comentários</span>
            <span>·</span>
            <span>{sharesCount.toLocaleString("pt-PT")} partilhas</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative px-2 py-1 flex items-center justify-between border-b border-[#CED0D4]/80 bg-white">
          {showReactionTray && (
            <div
              id="fb-reaction-tray"
              className="absolute -top-14 left-3 z-40 bg-white rounded-full px-3 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.18)] border border-[#E4E6EB] flex items-center gap-3 animate-fb-tray"
            >
              {[
                { type: "like" as ReactionType, label: "Gosto", svg: <FbLikeBadgeSvg size={36} /> },
                { type: "love" as ReactionType, label: "Adoro", svg: <FbLoveBadgeSvg size={36} /> },
                { type: "care" as ReactionType, label: "Força", svg: <FbCareBadgeSvg size={36} /> },
                { type: "wow" as ReactionType, label: "Uau", svg: <FbWowBadgeSvg size={36} /> },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleSelectReaction(item.type)}
                  className="group relative flex flex-col items-center transition-transform duration-150 hover:scale-125 active:scale-110"
                  title={item.label}
                >
                  {item.svg}
                  <span className="absolute -top-6 opacity-0 group-hover:opacity-100 bg-black/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full pointer-events-none transition-opacity whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleMainLikeButtonClick}
            onMouseDown={handleLikeButtonPointerDown}
            onMouseUp={handleLikeButtonPointerUpOrLeave}
            onMouseLeave={handleLikeButtonPointerUpOrLeave}
            onTouchStart={handleLikeButtonPointerDown}
            onTouchEnd={handleLikeButtonPointerUpOrLeave}
            className="flex-1 h-10 rounded-md hover:bg-[#F2F2F2] active:bg-[#E4E6EB] flex items-center justify-center gap-2 text-[14px] font-semibold transition"
            style={{ color: reactionButtonMeta ? reactionButtonMeta.color : "#65676B" }}
          >
            {reactionButtonMeta ? (
              reactionButtonMeta.icon
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7 11V20M7 11L10.6 3.8C11.35 3.8 12.5 4.55 12.5 6.2C12.5 7.45 12.1 8.85 11.75 9.8H18.4C19.65 9.8 20.6 10.95 20.35 12.2L19.05 18.6C18.85 19.45 18.1 20 17.2 20H7M7 11H4.2C3.54 11 3 11.54 3 12.2V18.8C3 19.46 3.54 20 4.2 20H7"
                  stroke="#65676B"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span>{reactionButtonMeta ? reactionButtonMeta.label : "Gosto"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              composerInputRef.current?.focus();
              composerInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="flex-1 h-10 rounded-md hover:bg-[#F2F2F2] active:bg-[#E4E6EB] flex items-center justify-center gap-2 text-[14px] font-semibold text-[#65676B] transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 11.5C20 15.64 16.42 19 12 19C10.75 19 9.56 18.73 8.5 18.25L4 19.5L5.2 15.6C4.44 14.4 4 13 4 11.5C4 7.36 7.58 4 12 4C16.42 4 20 7.36 20 11.5Z"
                stroke="#65676B"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Comentar</span>
          </button>

          <button
            type="button"
            onClick={handleShareClick}
            className="flex-1 h-10 rounded-md hover:bg-[#F2F2F2] active:bg-[#E4E6EB] flex items-center justify-center gap-2 text-[14px] font-semibold text-[#65676B] transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14 5L21 12L14 19V14.5C8.5 14.5 5 16.5 3 20C4 14 7 9.5 14 9.5V5Z"
                stroke="#65676B"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Partilhar</span>
          </button>
        </div>

        {/* Live Chat Header */}
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E41E3F] animate-fb-live-dot" />
            <span className="text-[13px] font-bold text-[#050505]">
              Chat em direto
            </span>
            <span className="text-[12px] text-[#65676B]">
              · Respostas e comentários
            </span>
          </div>
        </div>

        {/* General Welcome Typing Indicator */}
        {isModeratorTypingGeneral && (
          <div className="px-3.5 pb-2.5 animate-fb-comment">
            <div className="flex items-center gap-2.5 bg-[#F0F2F5] rounded-2xl px-3 py-2 border border-[#E4E6EB]">
              <PageOfficialAvatar size={28} withOnlineDot />
              <div className="flex items-center gap-1.5 text-[12px] text-[#65676B] font-medium">
                <span className="font-semibold text-[#050505]">{MODERATOR_NAME}</span>
                <span>está a escrever</span>
                <span className="inline-flex items-center gap-0.5 ml-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] fb-typing-dot-1" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] fb-typing-dot-2" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] fb-typing-dot-3" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── LIVE THREADED COMMENTS STREAM ─── */}
        <div className="px-3.5 pb-6 space-y-4">
          {visibleComments.map((comment) => (
            <div
              key={comment.id}
              className={`flex items-start gap-2.5 ${
                comment.justEntered ? "animate-fb-comment" : ""
              }`}
            >
              {/* Parent Avatar */}
              {comment.isModerator ? (
                <PageOfficialAvatar size={36} withOnlineDot />
              ) : (
                <UserAvatarWithFallback
                  name={comment.name}
                  avatarPath={comment.avatar}
                  size={36}
                  showOnlineDot={Boolean(comment.isLead)}
                />
              )}

              {/* Parent Column */}
              <div className="flex-1 min-w-0">
                {/* Parent Bubble */}
                <div className="relative inline-block max-w-full bg-[#F0F2F5] rounded-[18px] px-3.5 py-2">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="font-bold text-[13px] text-[#050505] leading-tight">
                      {comment.name}
                    </span>

                    {comment.isModerator && (
                      <>
                        <FbVerifiedBadgeSvg size={14} />
                        <span className="bg-[#E7F3FF] text-[#1877F2] border border-[#1877F2]/20 font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded">
                          MODERADOR
                        </span>
                      </>
                    )}

                    {comment.isLead && (
                      <span className="bg-[#E6F4EA] text-[#1E8E3E] border border-[#31A24C]/30 font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded">
                        VOCÊ
                      </span>
                    )}
                  </div>

                  <p className="text-[14px] text-[#050505] leading-[1.38] break-words">
                    {renderCommentText(comment.text)}
                  </p>

                  {comment.likes > 0 && (
                    <div className="absolute -bottom-2.5 right-2 bg-white rounded-full px-1.5 py-0.5 shadow-[0_1px_3px_rgba(0,0,0,0.16)] border border-[#E4E6EB] flex items-center gap-1">
                      <FbLikeBadgeSvg size={13} />
                      <span className="text-[11px] text-[#65676B] font-medium tabular-nums">
                        {comment.likes}
                      </span>
                    </div>
                  )}
                </div>

                {/* Parent Sub-actions */}
                <div className="flex items-center gap-3.5 pl-3 mt-1 text-[12px] text-[#65676B] font-semibold">
                  <span className="font-normal">{comment.timeLabel || "Agora"}</span>
                  <button
                    type="button"
                    onClick={() => toggleCommentLike(comment.id)}
                    className={`hover:underline ${
                      comment.likedByMe ? "text-[#1877F2] font-bold" : ""
                    }`}
                  >
                    Gosto
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartReply(comment.id, comment.name)}
                    className="hover:underline text-[#1877F2]"
                  >
                    Responder
                  </button>
                </div>

                {/* ─── NESTED THREAD (REPLIES INSIDE PARENT COMMENT) ─── */}
                {((comment.replies && comment.replies.length > 0) || typingParentId === comment.id) && (
                  <div className="mt-2.5 ml-1 pl-3.5 border-l-2 border-[#E4E6EB] space-y-2.5">
                    {comment.replies?.map((reply) => (
                      <div
                        key={reply.id}
                        className={`flex items-start gap-2 ${
                          reply.justEntered ? "animate-fb-comment" : ""
                        }`}
                      >
                        {/* Reply Avatar (Compact 28px) */}
                        {reply.isModerator ? (
                          <PageOfficialAvatar size={28} withOnlineDot />
                        ) : (
                          <UserAvatarWithFallback
                            name={reply.name}
                            avatarPath={reply.avatar}
                            size={28}
                            showOnlineDot={Boolean(reply.isLead)}
                          />
                        )}

                        {/* Reply Bubble */}
                        <div className="flex-1 min-w-0">
                          <div className="relative inline-block max-w-full bg-[#F0F2F5] rounded-[16px] px-3 py-1.5">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-bold text-[12px] text-[#050505] leading-tight">
                                {reply.name}
                              </span>

                              {reply.isModerator && (
                                <>
                                  <FbVerifiedBadgeSvg size={12} />
                                  <span className="bg-[#E7F3FF] text-[#1877F2] border border-[#1877F2]/20 font-bold text-[9px] uppercase tracking-wider px-1 py-0.2 rounded">
                                    MODERADOR
                                  </span>
                                </>
                              )}

                              {reply.isLead && (
                                <span className="bg-[#E6F4EA] text-[#1E8E3E] border border-[#31A24C]/30 font-bold text-[9px] uppercase tracking-wider px-1 py-0.2 rounded">
                                  VOCÊ
                                </span>
                              )}
                            </div>

                            <p className="text-[13px] text-[#050505] leading-[1.35] break-words">
                              {renderCommentText(reply.text)}
                            </p>

                            {reply.whatsappUrl && (
                              <div className="mt-2">
                                <a
                                  href={reply.whatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-[12px] px-3 py-1.5 rounded-full shadow-sm transition"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM17.85 16.22C17.61 16.9 16.43 17.52 15.86 17.61C15.35 17.69 14.71 17.73 14.01 17.51C13.58 17.37 13.03 17.19 12.33 16.89C9.37 15.61 7.44 12.63 7.29 12.43C7.15 12.23 6.09 10.83 6.09 9.38C6.09 7.93 6.85 7.22 7.12 6.93C7.39 6.64 7.71 6.57 7.91 6.57C8.11 6.57 8.31 6.57 8.48 6.58C8.66 6.59 8.91 6.51 9.15 7.09C9.4 7.69 10 9.14 10.07 9.29C10.15 9.44 10.2 9.61 10.1 9.81C10 10.01 9.95 10.14 9.8 10.31C9.65 10.48 9.49 10.69 9.35 10.82C9.2 10.97 9.04 11.13 9.22 11.43C9.4 11.73 10.01 12.73 10.92 13.54C12.09 14.58 13.07 14.9 13.37 15.05C13.67 15.2 13.85 15.18 14.02 14.98C14.2 14.78 14.77 14.11 14.97 13.81C15.17 13.51 15.37 13.56 15.65 13.66C15.93 13.76 17.42 14.5 17.72 14.65C18.02 14.8 18.22 14.88 18.29 15C18.37 15.13 18.09 15.54 17.85 16.22Z" />
                                  </svg>
                                  <span>{reply.whatsappLabel || "Falar no WhatsApp Oficial"}</span>
                                </a>
                              </div>
                            )}

                            {reply.likes > 0 && (
                              <div className="absolute -bottom-2 right-2 bg-white rounded-full px-1.5 py-0.2 shadow-[0_1px_3px_rgba(0,0,0,0.16)] border border-[#E4E6EB] flex items-center gap-1">
                                <FbLikeBadgeSvg size={11} />
                                <span className="text-[10px] text-[#65676B] font-medium tabular-nums">
                                  {reply.likes}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Reply Sub-actions */}
                          <div className="flex items-center gap-3 pl-2 mt-0.5 text-[11px] text-[#65676B] font-semibold">
                            <span className="font-normal">{reply.timeLabel || "Agora"}</span>
                            <button
                              type="button"
                              onClick={() => toggleReplyLike(comment.id, reply.id)}
                              className={`hover:underline ${
                                reply.likedByMe ? "text-[#1877F2] font-bold" : ""
                              }`}
                            >
                              Gosto
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartReply(comment.id, reply.name)}
                              className="hover:underline"
                            >
                              Responder
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Specific Moderator Typing Indicator inside this parent thread */}
                    {typingParentId === comment.id && (
                      <div className="flex items-center gap-2 animate-fb-comment">
                        <PageOfficialAvatar size={24} withOnlineDot />
                        <div className="bg-[#F0F2F5] rounded-xl px-2.5 py-1 text-[11px] text-[#65676B] flex items-center gap-1.5 border border-[#E4E6EB]">
                          <span className="font-semibold text-[#050505]">{MODERATOR_NAME}</span>
                          <span>está a responder</span>
                          <span className="inline-flex items-center gap-0.5 ml-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] fb-typing-dot-1" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] fb-typing-dot-2" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] fb-typing-dot-3" />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ─── FIXED BOTTOM COMPOSER (A responder a... context pill included) ─── */}
      <div
        id="fb-composer"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#DADDE1] shadow-[0_-1px_4px_rgba(0,0,0,0.05)]"
      >
        {replyingTo && (
          <div className="max-w-[520px] mx-auto px-3.5 py-1.5 bg-[#F0F2F5] border-b border-[#DADDE1] flex items-center justify-between text-xs text-[#65676B]">
            <span>
              A responder a <strong className="text-[#050505]">{replyingTo.name}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setReplyingTo(null);
                setComposerText("");
              }}
              className="text-[#1877F2] font-semibold hover:underline"
            >
              Cancelar
            </button>
          </div>
        )}

        <form
          onSubmit={handleSendLeadComment}
          className="max-w-[520px] mx-auto px-3 py-2 flex items-center gap-2"
        >
          <UserAvatarWithFallback name={leadFullName} size={34} showOnlineDot />

          <div className="flex-1 flex items-center bg-[#F0F2F5] border border-[#E4E6EB] rounded-full pl-3.5 pr-1.5 h-10 focus-within:border-[#1877F2] focus-within:bg-white transition">
            <input
              ref={composerInputRef}
              id="fb-composer-input"
              type="text"
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              placeholder={
                replyingTo
                  ? `Responder a ${replyingTo.name.split(" ")[0]}…`
                  : `Comentar como ${firstName}…`
              }
              className="flex-1 bg-transparent text-[14px] text-[#050505] placeholder-[#65676B] focus:outline-none min-w-0"
            />
            <button
              type="submit"
              disabled={!composerText.trim()}
              aria-label="Enviar comentário"
              className="w-7 h-7 rounded-full bg-[#1877F2] disabled:bg-[#BCC0C4] text-white flex items-center justify-center shrink-0 transition active:scale-95"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 20L21 12L3 4V10L15 12L3 14V20Z" fill="#FFFFFF" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectReaction("like")}
              aria-label="Reagir com Gosto"
              className="w-9 h-9 rounded-full hover:scale-110 active:scale-95 flex items-center justify-center transition"
            >
              <FbLikeBadgeSvg size={32} />
            </button>
            <button
              type="button"
              onClick={() => handleSelectReaction("love")}
              aria-label="Reagir com Adoro"
              className="w-9 h-9 rounded-full hover:scale-110 active:scale-95 flex items-center justify-center transition"
            >
              <FbLoveBadgeSvg size={32} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Video1Step;
