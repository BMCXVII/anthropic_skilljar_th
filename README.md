# Anthropic Academy (ภาษาไทย) — สื่อการเรียนรู้ Claude

เว็บสื่อการเรียนรู้ภาษาไทยที่สรุปเอาใจความสำคัญของคอร์ส [Anthropic Academy](https://anthropic.skilljar.com/)
ทั้ง **20 คอร์ส** (รวม 2 Case Studies ลงมือทำจริง) เพื่อใช้เรียนรู้ Claude อย่างเชี่ยวชาญ
ครบทุก function — ตั้งแต่การใช้งานพื้นฐาน ไปจนถึง Cowork, Claude Code, Slash Commands,
Skills, MCP, Hooks, Subagents และ Claude API พร้อมแบบทดสอบ (quiz) ในทุกคอร์สเพื่อเตรียมสอบ certificate

## วิธีเปิดใช้งาน

เปิดไฟล์ **`index.html`** ด้วยเบราว์เซอร์ได้เลย (ไม่ต้องติดตั้งหรือ build อะไร)

> เปิดผ่าน `file://` ได้ทันที — ฟอนต์โหลดจาก Google Fonts (ถ้าไม่มีเน็ตจะ fallback เป็นฟอนต์ระบบ ใช้งานได้ปกติ)

## โครงสร้างโปรเจกต์

```
index.html                  หน้า Hub รวมทุกคอร์ส (search / filter / progress)
courses/*.html              หน้าคอร์ส 18 หน้า (เนื้อหาสรุป + ตารางอ้างอิง + quiz)
assets/css/styles.css       design system (โทน Anthropic, dark mode, responsive)
assets/js/courses-data.js   ศูนย์กลางข้อมูลคอร์ส (ใช้สร้าง hub + sidebar)
assets/js/app.js            เครื่องมือกลาง: navbar, sidebar, TOC, theme, progress
assets/js/quiz.js            ระบบ quiz
```

## ฟีเจอร์

- 🎨 ดีไซน์ modern โทน Anthropic (clay/cream) อ่านสบายตา + **Dark mode** (ปุ่มมุมขวาบน)
- 🧭 Sidebar นำทางจัด 5 หมวด + แถบ "ในหน้านี้" (TOC) + แถบความคืบหน้าการอ่าน
- ✅ บันทึก **ความคืบหน้า** (เรียนจบคอร์สไหนแล้ว) ไว้ใน `localStorage` ของเบราว์เซอร์
- 📝 **Quiz** ท้ายทุกคอร์ส พร้อมเฉลยและคะแนน เพื่อซ้อมก่อนสอบ
- 🔎 ค้นหา/กรองคอร์สในหน้า Hub (กด `/` เพื่อค้นหาเร็ว)
- 📱 Responsive รองรับมือถือ

## หมวดหมู่คอร์ส

1. **เริ่มต้นกับ Claude** — Claude 101, AI Capabilities & Limitations
2. **Claude Code & Cowork** — Code 101, Code in Action, Cowork, Agent Skills, Subagents
3. **API & Model Context Protocol** — Building with the Claude API, MCP Intro, MCP Advanced
4. **Case Studies (ลงมือทำจริง)** — AI Dev Team, AI Finance Assistant
5. **Cloud Platforms** — Amazon Bedrock, Google Vertex AI
6. **AI Fluency** — Framework & Foundations, Students, Educators, Teaching, Nonprofits, Small Businesses

---

เนื้อหาเป็นบทสรุปภาษาไทยเพื่อการศึกษา — แนะนำให้ลงเรียนคอร์สจริงที่ Anthropic Academy
เพื่อดูเนื้อหาเต็มและรับ **certificate อย่างเป็นทางการ**
