import 'package:flutter/material.dart';

class VideoEditor extends StatelessWidget {
  final String? selectedAssetId;
  final double currentTime;
  final bool isPlaying;
  final VoidCallback onPlayPause;

  const VideoEditor({
    super.key,
    this.selectedAssetId,
    required this.currentTime,
    required this.isPlaying,
    required this.onPlayPause,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black,
      child: Column(
        children: [
          // ビデオプレビュー
          Expanded(
            child: Center(
              child: selectedAssetId != null
                  ? Container(
                      color: Colors.black,
                      child: const Center(
                        child: Text(
                          'ビデオプレビュー',
                          style: TextStyle(color: Colors.white54),
                        ),
                      ),
                    )
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          'アセットを選択してください',
                          style: TextStyle(color: Colors.white54),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '左側のパネルからビデオ、画像、またはドキュメントを選択',
                          style: TextStyle(
                            color: Colors.white38,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
            ),
          ),

          // ビデオコントロール
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: const Color(0xFF18181B), // zinc-900
              border: Border(
                top: BorderSide(
                  color: Theme.of(context).dividerColor,
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                // 再生コントロール
                IconButton(
                  icon: const Icon(Icons.skip_previous, size: 20),
                  onPressed: () {},
                  color: Colors.white70,
                  splashRadius: 20,
                ),
                IconButton(
                  icon: Icon(
                    isPlaying ? Icons.pause : Icons.play_arrow,
                    size: 20,
                  ),
                  onPressed: onPlayPause,
                  color: Colors.white70,
                  splashRadius: 20,
                ),
                IconButton(
                  icon: const Icon(Icons.skip_next, size: 20),
                  onPressed: () {},
                  color: Colors.white70,
                  splashRadius: 20,
                ),

                // タイムコード
                const SizedBox(width: 8),
                const Text(
                  '00:00:00',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: SliderTheme(
                    data: SliderThemeData(
                      trackHeight: 2,
                      thumbShape: const RoundSliderThumbShape(
                        enabledThumbRadius: 6,
                      ),
                      overlayShape: const RoundSliderOverlayShape(
                        overlayRadius: 14,
                      ),
                      activeTrackColor: Theme.of(context).primaryColor,
                      inactiveTrackColor: Colors.white24,
                      thumbColor: Theme.of(context).primaryColor,
                      overlayColor: Theme.of(context).primaryColor.withOpacity(0.2),
                    ),
                    child: Slider(
                      value: currentTime,
                      min: 0,
                      max: 90, // 90秒
                      onChanged: (value) {},
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  '00:01:30',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(width: 8),

                // 編集ツール
                IconButton(
                  icon: const Icon(Icons.content_cut, size: 20),
                  onPressed: () {},
                  color: Colors.white70,
                  splashRadius: 20,
                ),
                IconButton(
                  icon: const Icon(Icons.volume_up, size: 20),
                  onPressed: () {},
                  color: Colors.white70,
                  splashRadius: 20,
                ),

                // ズームコントロール
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.zoom_out, size: 20),
                  onPressed: () {},
                  color: Colors.white70,
                  splashRadius: 20,
                ),
                const Text(
                  '100%',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white70,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.zoom_in, size: 20),
                  onPressed: () {},
                  color: Colors.white70,
                  splashRadius: 20,
                ),
                IconButton(
                  icon: const Icon(Icons.fullscreen, size: 20),
                  onPressed: () {},
                  color: Colors.white70,
                  splashRadius: 20,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
