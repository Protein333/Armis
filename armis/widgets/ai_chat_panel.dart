import 'package:flutter/material.dart';

class AIChatPanel extends StatefulWidget {
  final List<Map<String, String>> chatHistory;
  final Function(String) onChatSubmit;

  const AIChatPanel({
    super.key,
    required this.chatHistory,
    required this.onChatSubmit,
  });

  @override
  State<AIChatPanel> createState() => _AIChatPanelState();
}

class _AIChatPanelState extends State<AIChatPanel> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void didUpdateWidget(AIChatPanel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.chatHistory.length > oldWidget.chatHistory.length) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _scrollToBottom();
      });
    }
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      decoration: BoxDecoration(
        border: Border(
          left: BorderSide(
            color: Theme.of(context).dividerColor,
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          // チャットヘッダー
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: Theme.of(context).dividerColor,
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.auto_awesome,
                  size: 16,
                  color: Theme.of(context).primaryColor,
                ),
                const SizedBox(width: 8),
                const Text(
                  'AIアシスタント',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.keyboard_arrow_down, size: 20),
                  onPressed: () {},
                  color: Colors.white70,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  splashRadius: 20,
                ),
              ],
            ),
          ),

          // チャット履歴
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(12),
              itemCount: widget.chatHistory.length,
              itemBuilder: (context, index) {
                final message = widget.chatHistory[index];
                final isUser = message['role'] == '  {
                final message = widget.chatHistory[index];
                final isUser = message['role'] == 'user';
                
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
                    children: [
                      Container(
                        constraints: BoxConstraints(
                          maxWidth: 200,
                        ),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isUser 
                              ? Theme.of(context).primaryColor 
                              : const Color(0xFF27272A), // zinc-800
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          message['content'] ?? '',
                          style: TextStyle(
                            fontSize: 13,
                            color: isUser ? Colors.white : Colors.white70,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),

          // メッセージ入力
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              border: Border(
                top: BorderSide(
                  color: Theme.of(context).dividerColor,
                  width: 1,
                ),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _messageController,
                        decoration: const InputDecoration(
                          hintText: 'AIに指示を入力...',
                          hintStyle: TextStyle(fontSize: 14, color: Colors.white38),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                        style: const TextStyle(fontSize: 14),
                        maxLines: 1,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (value) {
                          if (value.trim().isNotEmpty) {
                            widget.onChatSubmit(value);
                            _messageController.clear();
                          }
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor,
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.send, size: 16),
                        onPressed: () {
                          if (_messageController.text.trim().isNotEmpty) {
                            widget.onChatSubmit(_messageController.text);
                            _messageController.clear();
                          }
                        },
                        color: Colors.white,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(
                          minWidth: 36,
                          minHeight: 36,
                        ),
                        splashRadius: 18,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  '例: "PDFから解説動画を作成" "テキストを字幕付きで表示" "BGMを追加"',
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.white38,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
