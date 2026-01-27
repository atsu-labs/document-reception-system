import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            戻る
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            利用規約
          </h1>
          <p className="text-sm text-slate-600">
            最終更新日: {new Date().toLocaleDateString('ja-JP')}
          </p>
        </div>

        {/* Content */}
        <div className="prose max-w-none space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第1条（適用）
            </h2>
            <p className="leading-relaxed">
              本規約は、届出管理システム（以下「本サービス」といいます）の利用に関する条件を定めるものです。
              本サービスを利用するすべてのユーザー（以下「ユーザー」といいます）は、本規約に同意したものとみなされます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第2条（利用登録）
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>本サービスの利用を希望する者は、本規約に同意の上、所定の方法により利用登録を申請するものとします。</li>
              <li>当社は、登録申請者が以下のいずれかに該当する場合、登録を拒否することがあります。
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>虚偽の情報を登録した場合</li>
                  <li>過去に本規約違反により登録を抹消されたことがある場合</li>
                  <li>その他、当社が不適切と判断した場合</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第3条（アカウント管理）
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>ユーザーは、自己の責任において、本サービスのアカウント情報を適切に管理するものとします。</li>
              <li>ユーザーは、いかなる場合にも、アカウント情報を第三者に譲渡または貸与することはできません。</li>
              <li>アカウント情報の管理不十分、使用上の過誤、第三者の使用等による損害の責任はユーザーが負うものとします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第4条（禁止事項）
            </h2>
            <p className="leading-relaxed mb-2">
              ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>他のユーザーまたは第三者の権利を侵害する行為</li>
              <li>不正アクセス行為</li>
              <li>本サービスのセキュリティを脅かす行為</li>
              <li>虚偽の情報を登録する行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第5条（サービスの提供停止）
            </h2>
            <p className="leading-relaxed mb-2">
              当社は、以下のいずれかの事由がある場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>本サービスに係るシステムの保守点検または更新を行う場合</li>
              <li>地震、落雷、火災、停電等の不可抗力により、本サービスの提供が困難となった場合</li>
              <li>その他、当社が本サービスの提供が困難と判断した場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第6条（免責事項）
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>当社は、本サービスに事実上または法律上の瑕疵がないことを保証するものではありません。</li>
              <li>本サービスの利用により発生した損害について、当社は一切の責任を負いません。</li>
              <li>当社は、ユーザー間またはユーザーと第三者との間で生じたトラブルについて、一切の責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第7条（規約の変更）
            </h2>
            <p className="leading-relaxed">
              当社は、必要と判断した場合、ユーザーに通知することなく本規約を変更することができるものとします。
              変更後の規約は、本サービス上に掲示された時点から効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第8条（準拠法・裁判管轄）
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
              <li>本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄裁判所とします。</li>
            </ol>
          </section>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              以上
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
