import HomeInteractive from './HomeInteractive';

/** ISR : contenu public servi en HTML sans attendre l’hydratation client. */
export const revalidate = 3600;

export default function HomePage() {
  return <HomeInteractive />;
}
