type Props = {
  instagramUsername: string | null
  twitterUsername: string | null
}

export default function SocialLinks({ instagramUsername, twitterUsername }: Props) {
  if (!instagramUsername && !twitterUsername) return null

  return (
    <div className="flex items-center gap-3 mt-2">
      {instagramUsername && (
        <a
          href={`https://instagram.com/${instagramUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors"
        >
          <InstagramIcon />
          <span>@{instagramUsername}</span>
        </a>
      )}
      {twitterUsername && (
        <a
          href={`https://x.com/${twitterUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors"
        >
          <XIcon />
          <span>@{twitterUsername}</span>
        </a>
      )}
    </div>
  )
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
