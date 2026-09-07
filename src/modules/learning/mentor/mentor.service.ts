import { prisma } from '@/lib/prisma';
import { MentorChatMessage } from '@/types/learning';
import { marketRegimeService } from '@/modules/intelligence/advanced/regime/regime.service';
import { gamificationService } from '../gamification/gamification.service';

export class MentorService {
  /**
   * Socratic financial education AI Mentor.
   * Prompts critical pedagogical questions without spoon-feeding buy/sell signals.
   */
  public async processChat(userId: string, userMessage: string): Promise<MentorChatMessage> {
    // 1. Store user message
    await prisma.mentorMessage.create({
      data: {
        user_id: userId,
        role: 'user',
        content: userMessage,
      },
    });

    const msgLower = userMessage.toLowerCase();
    const regime = await marketRegimeService.getMarketRegime();

    let response = '';

    // Socratic response rules based on inquiry context
    if (msgLower.includes('beli') || msgLower.includes('buy') || msgLower.includes('rekomendasi') || msgLower.includes('bagus mana')) {
      response = `Pertanyaan yang menarik! Sebagai mentor edukasi Anda, mari kita bedah bersama melalui kerangka berpikir ilmiah:\n\n1. **Tesis Transaksi**: Apa alasan fundamental atau teknikal utama Anda tertarik pada emiten tersebut?\n2. **Bukti Data**: Apakah Anda sudah memeriksa rasio P/E, pertumbuhan laba (ROE), atau posisi indikator RSI-nya di halaman Analisis?\n3. **Kondisi Pasar**: Saat ini rezim pasar IHSG berada dalam kondisi **${regime.regime}** (${regime.score}/100). Apakah strategi Anda sudah selaras dengan tren pasar keseluruhan?\n4. **Manajemen Risiko**: Di level harga berapa Anda berencana memasang batas Stop Loss untuk membatasi potensi kerugian virtual Anda?`;
    } else if (msgLower.includes('rugi') || msgLower.includes('loss') || msgLower.includes('turun') || msgLower.includes('nyangkut')) {
      response = `Mengalami koreksi harga adalah bagian alami dari siklus belajar pasar modal. Mari kita lakukan evaluasi konstruktif:\n\n• Apakah penurunan ini membatalkan tesis awal Anda saat pertama kali membeli?\n• Apakah batas risiko (Stop Loss) yang Anda rencanakan di awal masih terjaga atau sudah tertembus?\n• Apa pelajaran terpenting yang bisa kita ambil mengenai ukuran posisi (position sizing) dari transaksi ini?`;
    } else if (msgLower.includes('rezim') || msgLower.includes('ihsg') || msgLower.includes('pasar') || msgLower.includes('makro')) {
      response = `Saat ini engine kecerdasan EduTradeX mendeteksi rezim pasar IHSG berada di fase **${regime.regime}** dengan skor **${regime.score}/100** dan rasio breadth **${regime.breadth.ratio}**.\n\nDalam kondisi ${regime.regime}, strategi apa yang menurut Anda paling bijak: menambah porsi saham defensif, menunggu konfirmasi breakout, atau memperbesar cadangan kas virtual?`;
    } else {
      response = `Pertanyaan yang bagus untuk memperdalam literasi finansial Anda!\n\nUntuk membangun pemahaman yang kokoh:\n1. Tinjau kembali pilar pendorong keputusan Anda (Fundamental, Teknikal, atau Valuasi).\n2. Selalu gunakan kalkulator position sizing untuk mengukur toleransi risiko maksimal (1%–2% per transaksi).\n3. Catat tesis Anda di Trading Journal agar performa proses belajar Anda dapat dievaluasi secara berkala.\n\nBagian mana dari analisis saham tersebut yang paling ingin Anda diskusikan lebih lanjut?`;
    }

    // 2. Store assistant response
    const assistantMessage = await prisma.mentorMessage.create({
      data: {
        user_id: userId,
        role: 'assistant',
        content: response,
      },
    });

    // Reward XP for active mentor discussion (+25 XP)
    await gamificationService.rewardXp(userId, 25, 'Diskusi dengan AI Mentor');

    return {
      id: assistantMessage.id,
      role: 'assistant',
      content: assistantMessage.content,
      timestamp: assistantMessage.created_at.toISOString(),
    };
  }

  public async getChatHistory(userId: string): Promise<MentorChatMessage[]> {
    const messages = await prisma.mentorMessage.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'asc' },
      take: 50,
    });

    if (messages.length === 0) {
      // Welcome message
      return [
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: `Halo! Saya adalah **AI Mentor EduTradeX**, guru edukasi keuangan virtual Anda. 👨‍🏫\n\nSaya di sini untuk membantu Anda mengasah logika analisis, disiplin manajemen risiko, dan pemahaman pasar modal secara mendalam. Tanyakan apa pun seputar tesis saham, analisis teknikal/fundamental, atau evaluasi jurnal transaksi Anda!`,
          timestamp: new Date().toISOString(),
        },
      ];
    }

    return messages.map((m) => ({
      id: m.id,
      role: m.role as any,
      content: m.content,
      timestamp: m.created_at.toISOString(),
    }));
  }
}

export const mentorService = new MentorService();
