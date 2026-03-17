import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin';

export async function GET(_request: NextRequest) {
  try {
    // Obținem lista REALĂ de utilizatori din Supabase Auth
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("Supabase Admin Error:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users,
    });

  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error)?.message || 'Eroare la obținerea utilizatorilor din Supabase' },
      { status: 500 }
    );
  }
}

// DELETE: Șterge un utilizator real din Supabase
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is missing" }, { status: 400 });
    }

    // Ștergem utilizatorul definitiv din baza de date Supabase
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "User deleted from Supabase" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
