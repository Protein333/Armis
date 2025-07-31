import 'package:flutter/material.dart';

class TimelinePanel extends StatelessWidget {
  final double currentTime;
  final Function(double) onTimeUpdate;
  final bool isPlaying;
  final VoidCallback onPlayPause;

  const TimelinePanel({
    super.key,
    required this.currentTime,
    required this.onTimeUpdate,
    required this.isPlaying,
    required this.onPlayPause,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black,
        border: Border(
          top: BorderSide(
            color: Theme.of(context).dividerColor,
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          // タイムラインヘッダー
          Container(
            height: 36,
            padding: const EdgeInsets.symmetric(horizontal: 8),
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
                TextButton.icon(
                  icon: const Icon(Icons.keyboard_arrow_down, size: 16),
                  label: const Text('タイムライン'),
                  onPressed: () {},
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.white70,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    textStyle: const TextStyle(fontSize: 12),
                  ),
                ),
                const Spacer(),
                ElevatedButton.icon(
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('トラック追加'),
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    foregroundColor: Colors.white70,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    textStyle: const TextStyle(fontSize: 12),
                    side: BorderSide(color: Theme.of(context).dividerColor),
                  ),
                ),
              ],
            ),
          ),

          // タイムラインコンテンツ
          Expanded(
            child: Row(
              children: [
                // トラックラベル
                Container(
                  width: 120,
                  decoration: BoxDecoration(
                    border: Border(
                      right: BorderSide(
                        color: Theme.of(context).dividerColor,
                        width: 1,
                      ),
                    ),
                  ),
                  child: Column(
                    children: [
                      _buildTrackLabel(context, 'ビデオ', Icons.videocam_outlined),
                      _buildTrackLabel(context, '画像', Icons.image_outlined),
                      _buildTrackLabel(context, 'テキスト', Icons.text_fields),
                      _buildTrackLabel(context, '音声', Icons.music_note_outlined),
                    ],
                  ),
                ),

                // タイムラインエリア
                Expanded(
                  child: Stack(
                    children: [
                      // 時間マーカー
                      Container(
                        height: 24,
                        decoration: BoxDecoration(
                          border: Border(
                            bottom: BorderSide(
                              color: Theme.of(context).dividerColor,
                              width: 1,
                            ),
                          ),
                        ),
                        child: Row(
                          children: List.generate(
                            10,
                            (index) => Expanded(
                              child: Container(
                                decoration: BoxDecoration(
                                  border: Border(
                                    right: BorderSide(
                                      color: Theme.of(context).dividerColor,
                                      width: 1,
                                    ),
                                  ),
                                ),
                                padding: const EdgeInsets.only(left: 4),
                                child: Text(
                                  '${index * 10}s',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    color: Colors.white54,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),

                      // トラック
                      Positioned(
                        top: 24,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        child: Column(
                          children: [
                            _buildTrack(context, 'intro.mp4', 40, 160, 0),
                            _buildTrack(context, 'slide1.png', 24, 100, 1),
                            _buildTrack(context, 'タイトル', 32, 120, 2),
                            _buildTrack(context, 'narration.mp3', 80, 320, 3),
                          ],
                        ),
                      ),

                      // 再生ヘッド
                      Positioned(
                        top: 0,
                        bottom: 0,
                        left: (currentTime / 90) * MediaQuery.of(context).size.width * 0.7,
                        child: Container(
                          width: 1,
                          color: Theme.of(context).primaryColor,
                          child: Stack(
                            clipBehavior: Clip.none,
                            children: [
                              Positioned(
                                top: 0,
                                left: -6,
                                child: Container(
                                  width: 12,
                                  height: 12,
                                  decoration: BoxDecoration(
                                    color: Theme.of(context).primaryColor,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrackLabel(BuildContext context, String label, IconData icon) {
    return Container(
      height: 32,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B), // zinc-900
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
            icon,
            size: 16,
            color: Colors.white70,
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrack(BuildContext context, String label, double width, double left, int trackIndex) {
    Color trackColor = Theme.of(context).primaryColor;
    
    return Container(
      height: 32,
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: Theme.of(context).dividerColor,
            width: 1,
          ),
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            top: 4,
            left: left,
            child: Container(
              height: 24,
              width: width,
              decoration: BoxDecoration(
                color: trackColor.withOpacity(0.2),
                border: Border.all(color: trackColor),
                borderRadius: BorderRadius.circular(2),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  color: trackColor,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
