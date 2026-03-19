'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { CvData, CvAmaliaStats } from '@amalia/shared'

// Register a clean font
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff', fontWeight: 700 },
  ],
})

const VIOLET = '#7c3aed'
const INK = '#18181b'
const MUTED = '#71717a'
const DIVIDER = '#e4e4e7'
const BG_LIGHT = '#fafafa'
const VERIFIED_BG = '#ede9fe'
const VERIFIED_TEXT = '#6d28d9'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: INK,
    backgroundColor: '#ffffff',
    paddingTop: 0,
    paddingBottom: 0,
  },
  // ── Header bar ─────────────────────────────────────────────────────
  header: {
    backgroundColor: VIOLET,
    paddingHorizontal: 40,
    paddingTop: 32,
    paddingBottom: 24,
  },
  headerName: {
    fontSize: 24,
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 11,
    color: '#ddd6fe',
    marginTop: 3,
    letterSpacing: 0.3,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  // ── Body layout ─────────────────────────────────────────────────────
  body: {
    flexDirection: 'row',
    flex: 1,
  },
  sidebar: {
    width: 170,
    backgroundColor: BG_LIGHT,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 24,
    borderRightWidth: 1,
    borderRightColor: DIVIDER,
  },
  main: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 24,
  },
  // ── Section ─────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: VIOLET,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  sectionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
    marginBottom: 10,
    marginTop: -2,
  },
  sectionGap: {
    marginBottom: 18,
  },
  // ── Bio ─────────────────────────────────────────────────────────────
  bio: {
    fontSize: 9,
    color: '#3f3f46',
    lineHeight: 1.6,
    marginBottom: 18,
  },
  // ── Links ───────────────────────────────────────────────────────────
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  linkLabel: {
    fontSize: 7.5,
    fontWeight: 700,
    color: MUTED,
    width: 42,
  },
  linkValue: {
    fontSize: 7.5,
    color: VIOLET,
    flex: 1,
  },
  // ── Skills ──────────────────────────────────────────────────────────
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  skillName: {
    fontSize: 8,
    color: INK,
    flex: 1,
  },
  skillBadge: {
    fontSize: 7,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    marginLeft: 4,
  },
  skillVerified: {
    backgroundColor: VERIFIED_BG,
    color: VERIFIED_TEXT,
  },
  skillUnverified: {
    backgroundColor: DIVIDER,
    color: MUTED,
  },
  skillLevel: {
    fontSize: 7,
    color: MUTED,
    marginLeft: 4,
  },
  // ── Soft skills ─────────────────────────────────────────────────────
  pill: {
    backgroundColor: VERIFIED_BG,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  pillText: {
    fontSize: 7.5,
    color: VERIFIED_TEXT,
    fontWeight: 700,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // ── Experience / Projects ────────────────────────────────────────────
  entryTitle: {
    fontSize: 9.5,
    fontWeight: 700,
    color: INK,
  },
  entrySub: {
    fontSize: 8,
    color: MUTED,
    marginTop: 1,
    marginBottom: 2,
  },
  entryDesc: {
    fontSize: 8,
    color: '#3f3f46',
    lineHeight: 1.5,
  },
  entryGap: {
    marginBottom: 10,
  },
  techRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 3,
  },
  techTag: {
    backgroundColor: '#f4f4f5',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 3,
    marginBottom: 2,
  },
  techText: {
    fontSize: 7,
    color: MUTED,
  },
  // ── Amalia Stats ─────────────────────────────────────────────────────
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 7.5,
    color: MUTED,
  },
  statValue: {
    fontSize: 7.5,
    fontWeight: 700,
    color: VIOLET,
  },
  badge: {
    backgroundColor: '#fef3c7',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 3,
    marginBottom: 3,
  },
  badgeText: {
    fontSize: 7,
    color: '#92400e',
  },
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  // ── Footer ───────────────────────────────────────────────────────────
  footer: {
    borderTopWidth: 1,
    borderTopColor: DIVIDER,
    paddingHorizontal: 40,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: MUTED,
  },
  footerBrand: {
    fontSize: 7,
    color: VIOLET,
    fontWeight: 700,
  },
})

interface Props {
  username: string
  cvData: CvData
  amaliaStats: CvAmaliaStats
}

export default function CvDocument({ username, cvData, amaliaStats }: Props) {
  const github = cvData.githubUrl?.replace('https://github.com/', '') ?? null

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerName}>{cvData.name}</Text>
          <Text style={styles.headerTitle}>{cvData.title}</Text>
          {cvData.email && (
            <Text style={[styles.headerTitle, { marginTop: 2 }]}>{cvData.email}</Text>
          )}
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✦ Verified by Amalia · amalia.dev</Text>
          </View>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>
          {/* ── Sidebar ── */}
          <View style={styles.sidebar}>
            {/* Contact */}
            {(github || cvData.email) && (
              <View style={styles.sectionGap}>
                <Text style={styles.sectionLabel}>Contatti</Text>
                <View style={styles.sectionDivider} />
                {cvData.email && (
                  <View style={styles.linkRow}>
                    <Text style={styles.linkLabel}>Email</Text>
                    <Text style={styles.linkValue}>{cvData.email}</Text>
                  </View>
                )}
                {github && (
                  <View style={styles.linkRow}>
                    <Text style={styles.linkLabel}>GitHub</Text>
                    <Text style={styles.linkValue}>github.com/{github}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Education */}
            {cvData.education && (
              <View style={styles.sectionGap}>
                <Text style={styles.sectionLabel}>Formazione</Text>
                <View style={styles.sectionDivider} />
                <Text style={styles.entryDesc}>{cvData.education}</Text>
              </View>
            )}

            {/* Technical Skills */}
            {cvData.skills.length > 0 && (
              <View style={styles.sectionGap}>
                <Text style={styles.sectionLabel}>Competenze</Text>
                <View style={styles.sectionDivider} />
                {cvData.skills.map((skill, i) => (
                  <View key={i} style={styles.skillRow}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    {skill.verified && (
                      <Text style={[styles.skillBadge, styles.skillVerified]}>✓</Text>
                    )}
                    <Text style={styles.skillLevel}>{skill.level}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Soft Skills */}
            {cvData.softSkills && cvData.softSkills.length > 0 && (
              <View style={styles.sectionGap}>
                <Text style={styles.sectionLabel}>Soft Skills</Text>
                <View style={styles.sectionDivider} />
                <View style={styles.pillsWrap}>
                  {cvData.softSkills.map((s, i) => (
                    <View key={i} style={styles.pill}>
                      <Text style={styles.pillText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Amalia Stats */}
            <View style={styles.sectionGap}>
              <Text style={styles.sectionLabel}>Amalia Platform</Text>
              <View style={styles.sectionDivider} />
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Sfide</Text>
                <Text style={styles.statValue}>{amaliaStats.challengesCompleted}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Accuratezza</Text>
                <Text style={styles.statValue}>{amaliaStats.accuracy}%</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Score</Text>
                <Text style={styles.statValue}>{amaliaStats.totalScore} pt</Text>
              </View>
              {amaliaStats.topLanguages.length > 0 && (
                <View style={[styles.statRow, { marginTop: 4 }]}>
                  <Text style={styles.statLabel}>{amaliaStats.topLanguages.join(', ')}</Text>
                </View>
              )}
              {amaliaStats.badges.length > 0 && (
                <View style={styles.badgesWrap}>
                  {amaliaStats.badges.map((b, i) => (
                    <View key={i} style={styles.badge}>
                      <Text style={styles.badgeText}>{b}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* ── Main ── */}
          <View style={styles.main}>
            {/* Bio */}
            <View style={styles.sectionGap}>
              <Text style={styles.sectionLabel}>Profilo</Text>
              <View style={styles.sectionDivider} />
              <Text style={styles.bio}>{cvData.bio}</Text>
            </View>

            {/* Experience */}
            {cvData.experience.length > 0 && (
              <View style={styles.sectionGap}>
                <Text style={styles.sectionLabel}>Esperienza</Text>
                <View style={styles.sectionDivider} />
                {cvData.experience.map((exp, i) => (
                  <View key={i} style={styles.entryGap}>
                    <Text style={styles.entryTitle}>{exp.title}</Text>
                    <Text style={styles.entrySub}>{exp.company}  ·  {exp.period}</Text>
                    <Text style={styles.entryDesc}>{exp.description}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Projects */}
            {cvData.projects.length > 0 && (
              <View style={styles.sectionGap}>
                <Text style={styles.sectionLabel}>Progetti</Text>
                <View style={styles.sectionDivider} />
                {cvData.projects.map((proj, i) => (
                  <View key={i} style={styles.entryGap}>
                    <Text style={styles.entryTitle}>{proj.name}</Text>
                    <Text style={styles.entryDesc}>{proj.description}</Text>
                    {proj.technologies.length > 0 && (
                      <View style={styles.techRow}>
                        {proj.technologies.map((t, j) => (
                          <View key={j} style={styles.techTag}>
                            <Text style={styles.techText}>{t}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            CV generato da Amalia AI · {new Date().getFullYear()}
          </Text>
          <Text style={styles.footerBrand}>amalia.dev</Text>
        </View>
      </Page>
    </Document>
  )
}
