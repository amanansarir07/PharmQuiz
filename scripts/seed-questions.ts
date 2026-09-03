/**
 * Seed script for Bujh
 *
 * Usage:
 *   1. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   2. Run: npx tsx scripts/seed-questions.ts
 *
 * This script:
 *   - Reads all question JSON files from data/questions/
 *   - Inserts subjects and units into Supabase
 *   - Inserts all questions into the database
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Import subject data
const { subjects } = require("../data/subjects");

interface QuestionData {
  unit_id: string;
  question_text: string;
  options: [string, string, string, string];
  correct_index: number;
  explanation: string;
  difficulty: string;
  tags: string[];
}

async function seed() {
  console.log("🏥 Bujh Seed Script");
  console.log("========================\n");

  // Step 1: Seed subjects
  console.log("📚 Seeding subjects...");
  for (const subject of subjects) {
    const { error } = await supabase.from("subjects").upsert(
      {
        id: subject.id,
        name: subject.name,
        slug: subject.slug,
        description: subject.description,
        icon: subject.icon,
        total_units: subject.units.length,
        exam_marks: subject.examMarks,
        order_index: subjects.indexOf(subject),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error(`  ❌ Error seeding subject ${subject.name}:`, error.message);
    } else {
      console.log(`  ✅ ${subject.name}`);
    }

    // Step 2: Seed units
    for (let i = 0; i < subject.units.length; i++) {
      const unit = subject.units[i];
      const { error: unitError } = await supabase.from("units").upsert(
        {
          id: unit.id,
          subject_id: subject.id,
          name: unit.name,
          slug: unit.slug,
          description: unit.description,
          order_index: i,
          exam_hours: unit.examHours,
        },
        { onConflict: "id" }
      );

      if (unitError) {
        console.error(`    ❌ Error seeding unit ${unit.name}:`, unitError.message);
      }
    }
    console.log(`  📦 ${subject.units.length} units seeded for ${subject.name}`);
  }

  // Step 3: Seed questions from JSON files
  console.log("\n❓ Seeding questions...");
  const questionsDir = join(__dirname, "..", "data", "questions");
  const files = readdirSync(questionsDir).filter((f: string) =>
    f.endsWith(".json")
  );

  let totalQuestions = 0;

  for (const file of files) {
    const filePath = join(questionsDir, file);
    const questions: QuestionData[] = JSON.parse(
      readFileSync(filePath, "utf-8")
    );

    console.log(`\n  📄 Processing ${file} (${questions.length} questions)...`);

    for (const q of questions) {
      const { error } = await supabase.from("questions").insert({
        unit_id: q.unit_id,
        question_text: q.question_text,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation,
        difficulty: q.difficulty,
        tags: q.tags,
        source: null,
      });

      if (error) {
        console.error(`    ❌ Error: ${error.message}`);
      } else {
        totalQuestions++;
      }
    }
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`   Subjects: ${subjects.length}`);
  console.log(`   Units: ${subjects.reduce((a: number, s: any) => a + s.units.length, 0)}`);
  console.log(`   Questions: ${totalQuestions}`);
}

seed().catch(console.error);
