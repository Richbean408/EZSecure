import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, GlassPanel, PageHeading, PanelBar, SectionHeading, TerminalScreen, ui } from '@/components/terminal-ui';
import { Terminal as T } from '@/constants/theme';

const questions = [
  { question: 'What is phishing?', answer: 'Phishing is a fake message or website that pretends to be a company or person you trust, like your bank, a delivery service or a friend. The goal is to trick you into giving away a password, a code or money. It often arrives by email, text message or social media.' },
  { question: 'How can I spot a suspicious message?', answer: 'Watch for messages that rush you (“act now or your account will be closed”), come from someone you were not expecting, have spelling mistakes, or ask for a password or a code. Before you tap a link, press and hold it to see the real address. When in doubt, skip the link and open the company’s app or website yourself.' },
  { question: 'Does the padlock mean a website is safe?', answer: 'No. The padlock only means the connection to the site is private. It does not mean the site is honest. Fake websites can have a padlock too, so always check the name of the site in the address bar.' },
  { question: 'What makes a strong password?', answer: 'Length matters most. Aim for at least 12 characters, and a few random words strung together works well. Never reuse a password, because every account should have its own. A password manager, like the Vault tab in this app, can remember them all for you.' },
  { question: 'Why should I not reuse passwords?', answer: 'When a website is hacked, criminals take the leaked passwords and try them on other sites, like your email and bank. If you reused one, they can get in. A different password for every account keeps one leak from becoming many.' },
  { question: 'What is two-step login?', answer: 'Two-step login (also called two-factor authentication) asks for a second proof that it is really you, like a code from an app, after your password. Even if someone steals your password, they still cannot get in. Turn it on for your email and bank first. Codes from an authenticator app are safer than codes sent by text message.' },
  { question: 'Is public Wi-Fi safe?', answer: 'It is riskier than your home network. Most sites are encrypted, but someone can set up a fake hotspot with a believable name, like “Airport Free WiFi”. On public Wi-Fi, avoid banking and sensitive logins, or use your phone’s mobile data instead.' },
  { question: 'Why should I update my phone and apps?', answer: 'Updates fix security holes that criminals already know about. Putting them off leaves the door open. The easiest fix is to turn on automatic updates.' },
  { question: 'What is malware?', answer: 'Malware is harmful software. It can steal your information, spy on you, or lock your files and demand money (this is called ransomware). It usually gets in because someone is tricked into installing an app or opening an attachment. Only install apps from the official app store, and do not open attachments you were not expecting.' },
  { question: 'What is a data breach?', answer: 'A data breach is when a company’s information is stolen or leaked, which can include emails and passwords. If you hear that an account of yours was in a breach, change that password right away, and change it anywhere else you used it. The Vault tab can check whether a password has shown up in known breaches.' },
  { question: 'What are common scam warning signs?', answer: 'Be careful when someone pressures you to act fast, asks you to keep it secret, asks for a verification code, or asks you to pay with gift cards, crypto or a wire transfer. Real companies do not ask for your password or codes by text or phone. If it sounds too good to be true, it usually is.' },
  { question: 'I clicked a bad link. What now?', answer: 'Stay calm. Close the page and do not type anything into it. If you already entered a password, change it right away, and change it anywhere else you used it. Turn on two-step login, and keep an eye on your accounts for anything strange. If you gave out money or card details, contact your bank.' },
];

export default function ExploreScreen() {
  const router = useRouter();
  return <TerminalScreen path="explore">
    <PageHeading eyebrow="04 / FIELD GUIDE" title="A little know-how" description="Get to know your tools and make sense of their results." />
    <GlassPanel>
      <PanelBar title="quick_start" label="READ ME" />
      <View style={ui.body}>
        <Text style={ui.command}>$ help --getting-started</Text>
        <Text style={s.title}>Start with a link.</Text>
        <Text style={ui.text}>Received an unfamiliar URL? Copy it, paste it into the phishing scanner, and review the result before you decide what to do.</Text>
        <ActionButton label="Open phishing scanner" onPress={() => router.push('/(tabs)/phishing')} />
      </View>
    </GlassPanel>
    <SectionHeading title="Reading the results" detail="STATUS GUIDE" />
    <GlassPanel style={{ paddingHorizontal: 20 }}>
      {[
        { title: 'Green / no issue detected', text: 'The model or scanner did not flag the submitted input.', color: T.accent, icon: 'check-circle' as const },
        { title: 'Amber / review needed', text: 'Review the reported activity, or retry an unavailable scan.', color: T.warning, icon: 'alert-triangle' as const },
        { title: 'Red / threat flagged', text: 'The submitted input was classified as a potential threat.', color: T.danger, icon: 'shield-off' as const },
      ].map((item, i) => <View key={item.title} style={[s.statusRow, i > 0 && s.border]}><Feather name={item.icon} size={21} color={item.color} /><View style={ui.flex}><Text style={[s.statusTitle, { color: item.color }]}>{item.title}</Text><Text style={ui.text}>{item.text}</Text></View></View>)}
    </GlassPanel>
    <SectionHeading title="Good to know" detail="SIMPLE FACTS" />
    <GlassPanel>{questions.map((item, i) => <Question key={item.question} {...item} first={i === 0} />)}</GlassPanel>
  </TerminalScreen>;
}
function Question({ question, answer, first }: { question: string; answer: string; first: boolean }) {
  const [open, setOpen] = useState(false);
  return <View style={!first && s.border}><Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(value => !value)} style={({ pressed }) => [s.question, pressed && { opacity: 0.7 }]}><Text style={s.questionText}>{question}</Text><Feather name={open ? 'minus' : 'plus'} size={18} color={T.accent} /></Pressable>{open && <Text style={[ui.text, { paddingHorizontal: 20, paddingBottom: 20 }]}>{answer}</Text>}</View>;
}
const s = StyleSheet.create({
  title: { fontFamily: T.mono, fontSize: 24, lineHeight: 32, color: T.text, fontWeight: '600' },
  statusRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', paddingVertical: 22 },
  statusTitle: { fontFamily: T.mono, fontSize: 13, lineHeight: 22, fontWeight: '600', marginBottom: 6 },
  border: { borderTopWidth: 1, borderTopColor: T.border },
  question: { flexDirection: 'row', gap: 16, padding: 20, alignItems: 'center', minHeight: 64 },
  questionText: { flex: 1, fontFamily: T.mono, fontSize: 13, lineHeight: 22, color: T.text },
});
