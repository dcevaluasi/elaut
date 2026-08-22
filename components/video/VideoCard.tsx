import React from "react";
import { extractYoutubeId } from "@/utils/videos";
import { motion } from "framer-motion";
import { FiPlay, FiYoutube } from "react-icons/fi";

export function VideoCard({ video, onClick }: {
    video: any;
    onClick: () => void;
}) {
    const [hovered, setHovered] = React.useState(false);
    const ytId = extractYoutubeId(video.linkPelatihan);
    const thumbnailUrl = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
    const fallbackUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative group cursor-pointer rounded-[2rem] overflow-hidden border border-white/10 hover:border-blue-500/40 transition-all duration-300 bg-[#1e293b]/30 shadow-lg hover:shadow-blue-500/10 h-full flex flex-col"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
        >
            <div className="relative aspect-video w-full overflow-hidden">
                <img
                    src={thumbnailUrl}
                    alt={video.namaPelatihan}
                    onError={(e) => { (e.target as HTMLImageElement).src = fallbackUrl; }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#090e1a] via-[#090e1a]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.div
                        animate={{ scale: hovered ? 1.1 : 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="w-16 h-16 rounded-full bg-blue-600/90 backdrop-blur-md border border-blue-400/50 flex items-center justify-center shadow-xl shadow-blue-500/50"
                    >
                        <FiPlay size={24} className="text-white translate-x-0.5" fill="white" />
                    </motion.div>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                    <FiYoutube size={12} className="text-red-400" />
                    <span className="text-[10px] text-gray-200 font-bold uppercase tracking-wider">E-LAUT Video</span>
                </div>

                <div className="absolute bottom-3 left-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-blue-600/80 text-white border border-blue-400/30 backdrop-blur-sm shadow-lg">
                        {video.programPelatihan || video.jenisProgramPelatihan || "Umum"}
                    </span>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <h4 className="font-bold font-calsans text-white text-lg leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
                        {video.namaPelatihan}
                    </h4>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-3 leading-relaxed">
                        {video.descriptionVideo}
                    </p>
                </div>
                <div className="mt-6 flex items-center gap-2 pt-4 border-t border-white/5">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <span className="text-indigo-300 text-[10px] font-bold">BP</span>
                    </div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                        {video.penyelenggara}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
