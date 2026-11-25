// Dummy data. Replace with Google Forms / Drive API results later.
export const STATUSES = ['To review', 'Graded', 'Needs follow-up']
const NAMES = ['Ana Reyes','Ben Cruz','Carla Santos','Dan Lim','Ella Tan','Faye Ramos','Gio Uy','Hana Diaz','Ivan Co','Jade Ong','Kyle Go','Lia Sy']
const make = (n, fn) => NAMES.slice(0, n).map((name, i) => ({ id: 'r' + i, notes: '', ...fn(name, i) }))
const pick = (i, ...a) => a[i % a.length]
const st = (i, a, b) => STATUSES[i < a ? 1 : i < b ? 0 : 2]

export const NAME_POOL = NAMES

export const FORMS = {
  f1: {
    name: 'Grade 8 Science Quiz', type: 'Quiz', modified: 'Edited 2 days ago',
    fields: [['name','Student name'],['section','Section'],['score','Score (/20)'],['q1','Explain photosynthesis'],['q2','Gas absorbed by plants']],
    layout: { title: 'name', show: ['section','score','q2'], group: 'status' },
    responses: make(12, (n, i) => ({ status: st(i, 5, 9), answers: {
      name: n, section: pick(i,'Newton','Darwin','Curie'), score: 10 + (i * 7) % 11,
      q1: pick(i,'Plants turn sunlight, water and CO₂ into sugar and oxygen.','It’s how plants make food using light.','Happens in the chloroplast and releases oxygen.','Plants eat sunlight.'),
      q2: pick(i,'CO₂','Oxygen','CO₂','Nitrogen') } })),
  },
  f2: {
    name: 'Student Wellbeing Survey', type: 'Survey', modified: 'Edited last week',
    fields: [['name','Name (optional)'],['grade','Grade level'],['mood','Mood this week'],['comment','Anything else?']],
    layout: { title: 'name', show: ['grade','mood'], group: 'mood' },
    responses: make(10, (n, i) => ({ status: st(i, 4, 8), answers: {
      name: i % 3 ? n : 'Anonymous', grade: pick(i,'Grade 7','Grade 8','Grade 9'), mood: pick(i,'Great','Okay','Stressed','Okay'),
      comment: pick(i,'I feel stressed before exams.','Group work helps me a lot.','Please add more breaks.','Everything is fine, thank you!') } })),
  },
  f3: {
    name: 'Midterm Exam: Algebra', type: 'Exam', modified: 'Edited 3 weeks ago',
    fields: [['name','Student name'],['section','Section'],['score','Score (/50)'],['essay','Problem 5 solution']],
    layout: { title: 'name', show: ['section','score'], group: 'status' },
    responses: make(8, (n, i) => ({ status: st(i, 3, 7), answers: {
      name: n, section: pick(i,'Newton','Darwin'), score: 28 + (i * 5) % 22,
      essay: pick(i,'Solved with the quadratic formula; checked both roots.','Skipped steps but the final answer is right.','Did not show work.','Complete and well organized.') } })),
  },
  f4: {
    name: 'Field Trip Permission Slip', type: 'Other', modified: 'Edited 1 month ago',
    fields: [['name','Parent name'],['student','Student'],['consent','Consent given']],
    layout: { title: 'student', show: ['name','consent'], group: 'status' },
    responses: make(6, (n, i) => ({ status: i < 4 ? 'Graded' : 'To review', answers: {
      name: 'Mr/Ms ' + n.split(' ')[1], student: NAMES[(i + 5) % 12], consent: i === 4 ? 'No' : 'Yes' } })),
  },
}
