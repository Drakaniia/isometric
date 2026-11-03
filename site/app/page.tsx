import Link from 'next/link';
import Header from '@/components/Header';
import HeroFigure from '@/components/landing/HeroFigure';
import Figure from '@/components/landing/Figure';
import TokenTable from '@/components/landing/TokenTable';
import { STYLES, STYLE_IDS, library } from '@kit';
import { REPO, REPO_URL } from '@/lib/site';

const PROMPTS: { id: string; style: 'two-tone' | 'anatomy' | 'duotone' | 'fill' | 'stroke'; prompt: string; note: string }[] = [
  { id: 'login-page', style: 'two-tone', prompt: '/isometric create an isometric for my login page', note: 'No style named, so Two-tone in the project’s own accent.' },
  { id: 'kanban-board', style: 'anatomy', prompt: '/isometric a kanban board for the dashboard hero, Anatomy style', note: 'Naming the style puts it on the plinth.' },
  { id: 'settings-panel', style: 'duotone', prompt: '/isometric the settings page, duotone in our brand blue #5b7cfa', note: 'One colour in the line becomes the whole palette.' },
  { id: 'server-rack', style: 'fill', prompt: '/isometric a server rack for the infrastructure section, fill style, facing left', note: 'Facing and pose are words too.' },
];

const STEPS: [string, string][] = [
  ['Understand', 'Which page or section, what the drawing must show, icon or scene, and the style. If no style is named, Claude reads your tokens, maps the brand colour to the accent and uses Two-tone.'],
  ['Inspect the project', 'Framework, colour tokens, where components and assets live, and the lint, typecheck and test scripts it will have to pass.'],
  ['Open the closest sample', `${library.length} drawings ship with the skill. A login page starts from the login scene, a pricing hero from the devices scene.`],
  ['Write a model', 'Not an SVG: a list of parts in world units, each with a role (body, face, detail, ink, accent). A login card has fields, a button and an avatar, not abstract slabs.'],
  ['One accent', 'Exactly one part is lit: the one the reader should watch. Everything else stays in ink and faces.'],
  ['Render the style', 'The renderer sorts the solids, shades each face by the way it turns to the light and paints the roles in the chosen style.'],
  ['Author the motion', 'Only when it helps: the button presses, the drawer slides. It stops under reduced motion, and the still is a complete picture.'],
  ['Integrate', 'A self-contained React component (or plain SVG) next to your other components, wired into the page you named.'],
  ['Check it', 'SVG validation, a depth audit with zero cycles, your lint and typecheck, and a rendered preview that is actually looked at.'],
];

const FAQ: [string, React.ReactNode][] = [
  ['Does it need React?', <>No. It writes a self-contained TSX component for React and Next.js projects, and plain SVG for everything else. The SVG has its colours baked in; the component reads <code>--iso-*</code> variables.</>],
  ['Can I change a drawing after it is made?', <>Yes. The model is ordinary code in your project. Ask Claude for the change or edit a part’s size or role yourself; every style, facing and pose re-renders from the same model.</>],
  ['Do I have to pick a style?', <>No. Without one, Claude uses Two-tone with your brand colour as the accent. Say “Anatomy”, “stroke”, “fill” or “duotone” to change it, or give your own colours.</>],
  ['Will it slow my page down?', <>A drawing is one inline SVG, usually 5 to 60 KB. Motion is a set of pre-rendered frames swapped on hover; nothing runs until someone points at it, and nothing runs at all under reduced motion.</>],
  ['Is it accessible?', <>Every drawing has a title and a description, the gallery works by keyboard, and motion respects <code>prefers-reduced-motion</code>.</>],
  ['What is the licence?', <>MIT, for the skill, the renderer and every drawing.</>],
];

export default function Home() {
  return (
    <>
      <Header />
      <main id="main" className="land">
        <section className="hero">
          <p className="kicker">/isometric · a skill for Claude Code</p>
          <h1 className="serif">Name a page in one line, and Claude draws it in isometric.</h1>
          <p className="lede">
            Ask for <em>an isometric for my login page</em> and you get a real drawing of one, built from dozens of small solid parts, in clean ink
            line art. It renders in six styles, faces left or right, stands or lies down, and lands in your project as a component in your colours.
          </p>
          <div className="hero-ctas">
            <a className="cta" href="#install">Install</a>
            <Link className="btn" href="/gallery/">Browse {library.length} drawings</Link>
          </div>
          <HeroFigure />
        </section>

        <section className="sec" id="styles">
          <header className="sec-head"><span className="sec-no">01</span><h2 className="serif">One model, six styles</h2></header>
          <p className="prose">
            A drawing is a model, not a picture. Every part has a role, and a style decides how roles are painted. Switching style never redraws
            anything by hand, so the same devices scene reads as a line icon, a brand illustration or an Anatomy figure on its plinth.
          </p>
          <div className="style-grid">
            {STYLE_IDS.map((s) => (
              <figure key={s} className="style-card">
                <Figure id="devices" opts={{ style: s }} uid={`st-${s}`} className="style-card-art" />
                <figcaption><strong>{STYLES[s].label}</strong><span>{STYLES[s].blurb}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="sec" id="prompts">
          <header className="sec-head"><span className="sec-no">02</span><h2 className="serif">Writing a prompt</h2></header>
          <p className="prose">
            Say what the page is, not what to draw. “My login page” is enough; deciding that it is a browser window with a sign-in card and a padlock
            is the part Claude is asked to do. A few words change what you get, and Claude only uses them when you write them:
          </p>
          <ul className="words">
            <li><code>stroke</code> <code>two-tone</code> <code>duotone</code> <code>fill</code> <code>anatomy</code> pick the style</li>
            <li><code>icon</code> or <code>scene</code> sets the size: one object, or a set piece on a plinth</li>
            <li><code>#hex</code> or “our brand colour” sets the accent; “dark theme” flips the palette</li>
            <li><code>facing left</code>, <code>lying</code> turn the object; <code>animated on hover</code> adds motion</li>
          </ul>
          <div className="prompt-grid">
            {PROMPTS.map((p) => (
              <figure key={p.id} className="prompt-card">
                <code className="prompt-line">{p.prompt}</code>
                <Figure id={p.id} opts={{ style: p.style, facing: p.prompt.includes('facing left') ? 'left' : 'right' }} uid={`pr-${p.id}`} className="prompt-art" />
                <figcaption>{p.note}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="sec" id="how">
          <header className="sec-head"><span className="sec-no">03</span><h2 className="serif">What Claude does</h2></header>
          <p className="prose">Between your line and the finished component, Claude works through a fixed order. Most of the quality is decided before any geometry exists.</p>
          <ol className="steps">
            {STEPS.map(([t, body], i) => (
              <li key={t}><span className="step-no">{String(i + 1).padStart(2, '0')}</span><h3>{t}</h3><p>{body}</p></li>
            ))}
          </ol>
        </section>

        <section className="sec" id="code">
          <header className="sec-head"><span className="sec-no">04</span><h2 className="serif">In your code</h2></header>
          <p className="prose">
            Every drawing in the gallery copies out as a React component with no dependencies beyond React. Pass your colours as tokens and every
            shade follows; set motion to play on hover, loop or stay still.
          </p>
          <div className="code-grid">
            <pre className="code"><span className="c-file">app/login/page.tsx</span>{`import LoginPage from "@/components/illustrations/LoginPage";

export default function Login() {
  return (
    <aside className="hero-art">
      <LoginPage
        tokens={{ accent: "#ef6c4d", ink: "#1f1f22" }}
        weight={1}
        animate="hover"
      />
    </aside>
  );
}`}</pre>
            <pre className="code"><span className="c-file">index.html</span>{`<!-- Plain SVG: colours baked in, scales to its container -->
<img src="/illustrations/login-page-two-tone.svg"
     alt="A browser window with a sign-in card"
     width="480">

<!-- or inline it, and restyle any --iso-* variable -->
<svg viewBox="…" role="img" aria-labelledby="t d"
     style="--iso-accent-t:#ff8a6b">…</svg>`}</pre>
          </div>
          <TokenTable />
        </section>

        <section className="sec" id="install">
          <header className="sec-head"><span className="sec-no">05</span><h2 className="serif">Install</h2></header>
          <p className="prose">Install from the repository below after this version is pushed, or unzip the portable skill bundle into <code>~/.claude/skills/</code> (or your agent’s skills directory). The compiled renderer is included.</p>
          <p><a className="btn" href={REPO_URL}>Open the skill repository</a></p>
          <p className="prose small">The skill repository is <a href={REPO_URL}>{REPO}</a>. This hosting environment cannot serve archives; the portable ZIP is delivered separately. CLI installation requires this local version to be pushed to the repository.</p>
          <pre className="code">{`npx skills add ${REPO}           # this project
npx skills add ${REPO} -g        # every project

# or clone it into your skills folder
git clone ${REPO_URL}.git ~/.claude/skills/isometric`}</pre>
          <pre className="code">{`/isometric create an isometric for my login page
/isometric a hero for the pricing section, anatomy style
/isometric icons for the three feature cards: database, shield, rocket
/isometric our onboarding steps as a kanban board, facing left, dark theme`}</pre>
          <p className="prose small">Check it worked: start Claude Code in a project and type <code>/isometric</code>. The skill needs Node.js 20 or newer; nothing is installed into your project.</p>
        </section>

        <section className="sec" id="limits">
          <header className="sec-head"><span className="sec-no">06</span><h2 className="serif">Limits</h2></header>
          <ul className="limits">
            <li><strong>Orthographic only.</strong> One isometric camera, no perspective, no photoreal rendering. Charts and data plots are not what it is for.</li>
            <li><strong>Boxes, cylinders, cones, spheres and extrusions.</strong> Curved shells and organic shapes are approximated from those.</li>
            <li><strong>The first drawing is a draft.</strong> It is right in structure and often wrong in a detail. Look at it, say what is off, and ask again.</li>
            <li><strong>Scenes take longer.</strong> An icon takes minutes; a scene with forty parts and motion takes longer, and Claude says so first.</li>
            <li><strong>References are for mood.</strong> A screenshot sets the finish and the colours. It will not copy someone else’s drawing.</li>
          </ul>
        </section>

        <section className="sec" id="faq">
          <header className="sec-head"><span className="sec-no">07</span><h2 className="serif">Questions</h2></header>
          <div className="faq">
            {FAQ.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </section>

        <footer className="foot">
          <span>Isometric · MIT</span>
          <span><Link href="/gallery/">Gallery</Link> · <a href={REPO_URL}>Source</a> · <a href="#install">Install</a></span>
        </footer>
      </main>
    </>
  );
}
