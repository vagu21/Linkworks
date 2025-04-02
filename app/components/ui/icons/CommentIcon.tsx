export default function CommentIcon({ className, strokeColor = "#1B1714" }: { className?: string; strokeColor?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path
        d="M18.3244 3.33317C18.3244 2.4165 17.5827 1.6665 16.666 1.6665H3.33268C2.41602 1.6665 1.66602 2.4165 1.66602 3.33317V13.3332C1.66602 14.2498 2.41602 14.9998 3.33268 14.9998H14.9993L18.3327 18.3332L18.3244 3.33317ZM16.666 3.33317V14.3082L15.691 13.3332H3.33268V3.33317H16.666ZM4.99935 9.99984H14.9993V11.6665H4.99935V9.99984ZM4.99935 7.49984H14.9993V9.1665H4.99935V7.49984ZM4.99935 4.99984H14.9993V6.6665H4.99935V4.99984Z"
        fill={strokeColor}
      />
    </svg>
  );
}