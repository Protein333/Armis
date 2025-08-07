import 'package:flutter/material.dart';
import '../widgets/asset_panel.dart';
import '../widgets/video_editor.dart';
import '../widgets/timeline_panel.dart';
import '../widgets/ai_chat_panel.dart';

class EditorScreen extends StatefulWidget {
  const EditorScreen({super.key});

  @override
  State<EditorScreen> createState() => _EditorScreenState();
}

class _EditorScreenState extends State<EditorScreen> {
  String? selectedAssetId;
  double currentTime = 0.0;
  bool isPlaying = false;
  final List<Map<String, String>> chatHistory = [];

  void handleAssetSelect(String assetId) {
    setState(() {
      selectedAssetId = assetId;
    });
  }

  void handleTimeUpdate(double time) {
    setState(() {
      currentTime = time;
    });
  }

  void handlePlayPause() {
    setState(() {
      isPlaying = !isPlaying;
    });
  }

  void handleChatSubmit(String message) {
    setState(() {
      chatHistory.add({'role': 'user', 'content': message});
    });

    // Simulate AI response
    Future.delayed(const Duration(seconds: 1), () {
      setState(() {
        chatHistory.add({
          'role': 'assistant',
          'content': '「$message」という指示を受け取りました。動画編集を進めています...',
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Image.asset('assets/images/icon.png', width: 24, height: 24),
            const SizedBox(width: 8),
            const Text('Armis', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.save_outlined, size: 20),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined, size: 20),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined, size: 20),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.help_outline, size: 20),
            onPressed: () {},
          ),
        ],
      ),
      body: Row(
        children: [
          // アセットパネル
          AssetPanel(onAssetSelect: handleAssetSelect),
          
          // メインエディタとタイムライン
          Expanded(
            child: Column(
              children: [
                // ビデオエディタ
                Expanded(
                  child: VideoEditor(
                    selectedAssetId: selectedAssetId,
                    currentTime: currentTime,
                    isPlaying: isPlaying,
                    onPlayPause: handlePlayPause,
                  ),
                ),
                
                // タイムライン
                SizedBox(
                  height: 200,
                  child: TimelinePanel(
                    currentTime: currentTime,
                    onTimeUpdate: handleTimeUpdate,
                    isPlaying: isPlaying,
                    onPlayPause: handlePlayPause,
                  ),
                ),
              ],
            ),
          ),
          
          // AIチャットパネル
          AIChatPanel(
            chatHistory: chatHistory,
            onChatSubmit: handleChatSubmit,
          ),
        ],
      ),
    );
  }
}
