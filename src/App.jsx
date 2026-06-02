import { useState, useEffect } from 'react'
import ImageReviewHelper, { AIReviewMode } from './CompositionHelper.jsx'

const PROJECT_TYPES = [
  { id: 'general', label: 'General' },
  { id: 'villa', label: 'Villa' },
  { id: 'shophouse', label: 'Shophouse' },
  { id: 'townhouse', label: 'Townhouse' },
  { id: 'public-landscape', label: 'Public Landscape' },
  { id: 'park', label: 'Park' },
  { id: 'street-view', label: 'Street View' },
  { id: 'interior', label: 'Interior' },
]

const STORYTELLING_ITEMS_BY_TYPE = {
  general: [
    {
      title: 'Thông điệp chính của ảnh',
      summary: 'Mỗi ảnh phải có một ý chính rõ ràng trước khi đi vào chi tiết.',
      lookAt: 'Nhìn tổng thể ảnh và tự hỏi: ảnh này đang bán điều gì — kiến trúc, lifestyle (cách sống), sự riêng tư, cảnh quan, ánh sáng, tiện ích hay cảm giác cao cấp?',
      cue: 'Một ảnh tốt thường chỉ tập trung vào một thông điệp chính. Nếu ảnh muốn nói quá nhiều thứ cùng lúc, người xem sẽ không nhớ rõ điều gì.',
      common: 'Ảnh có nhiều chi tiết đẹp nhưng không có trọng tâm; artist chăm cây, xe, người, texture nhưng công trình chính không nổi; mood (cảm xúc tổng thể) và camera không phục vụ cùng một ý.',
      fix: 'Tự viết một câu ngắn cho ảnh: "Ảnh này bán ___". Sau đó giảm hoặc làm mềm những yếu tố không phục vụ câu này. Dùng framing (cách dựng khung hình), ánh sáng, contrast (tương phản sáng tối) và crop (cắt khung) để đẩy thông điệp chính lên.',
      selfCheck: 'Nếu phải đặt tên cho ảnh này bằng 5 từ, bạn sẽ đặt là gì?',
    },
    {
      title: 'Hero (điểm chính cần khoe) có đủ mạnh không',
      summary: 'Hero phải là thứ người xem nhìn thấy đầu tiên trong 3 giây đầu.',
      lookAt: 'Xác định hero (điểm chính cần khoe) của ảnh: facade, entrance (lối vào), balcony, courtyard (sân trong), pool, lobby, skyline, public plaza hoặc một khoảnh khắc lifestyle.',
      cue: 'Hero không nhất thiết phải nằm giữa ảnh, nhưng phải có lực hút thị giác mạnh nhất. Khi nheo mắt nhìn ảnh, hero vẫn phải đọc được rõ ràng.',
      common: 'Hero bị cây che, bị xe / người tranh sự chú ý, chìm trong shadow (vùng tối), quá nhỏ trong frame, hoặc không có contrast đủ mạnh so với xung quanh.',
      fix: 'Tăng độ ưu tiên cho hero bằng ánh sáng, contrast, crop, camera angle, depth of field nhẹ (làm mờ vùng phụ), giảm saturation (độ bão hòa màu) / contrast vùng phụ, hoặc dời người và xe ra chỗ khác.',
      selfCheck: 'Khi nheo mắt, hero có còn là điểm sáng / contrast cao nhất không?',
    },
    {
      title: 'Chính / phụ / nền có rõ không',
      summary: 'Ảnh cần lớp chính, lớp hỗ trợ và lớp nền — không phải mọi thứ quan trọng ngang nhau.',
      lookAt: 'Chia ảnh thành 3 lớp: lớp chính (thứ cần bán), lớp phụ (yếu tố hỗ trợ câu chuyện), lớp nền (bối cảnh tạo không khí).',
      cue: 'Nếu foreground (lớp phía trước), cây, sky, xe, người và công trình đều đòi sự chú ý như nhau, ảnh sẽ bị ồn. Visual hierarchy (thứ tự chính phụ) tốt nghĩa là vùng phụ biết lùi xuống.',
      common: 'Foreground quá nặng, sky quá đẹp nhưng lấn công trình, entourage (người, xe, cây) quá nổi, cây xanh quá bão hòa màu, background (lớp nền) quá sáng hoặc quá nhiều contrast.',
      fix: 'Giảm contrast / saturation / sharpness của vùng phụ. Tăng ánh sáng hoặc độ rõ cho hero. Dùng crop và framing để loại bớt vùng không phục vụ ảnh.',
      selfCheck: 'Bạn có chỉ ra được rõ 3 lớp: chính, phụ, gây nhiễu không?',
    },
    {
      title: 'Đường dẫn mắt người xem',
      summary: 'Mắt người xem cần được dẫn vào hero một cách tự nhiên.',
      lookAt: 'Theo dõi mắt bạn đi qua ảnh: điểm đầu tiên nhìn vào là đâu, sau đó đi đâu, có quay lại hero không hay bị kéo ra ngoài frame?',
      cue: 'Ảnh mạnh thường có visual flow (dòng mắt): foreground dẫn vào midground (lớp giữa), ánh sáng dẫn vào hero, đường line kiến trúc dẫn vào focal point (điểm tụ thị giác).',
      common: 'Mắt bị kéo vào góc ảnh, đường dẫn bị cây / xe chặn, vật sáng nằm sai chỗ, người xem nhìn sky hoặc foreground nhiều hơn công trình.',
      fix: 'Dùng leading lines (đường dẫn mắt), shadow, brightness, contrast, scale của người / xe, hướng nhìn nhân vật, opening trong cây, hoặc crop để dẫn mắt về hero.',
      selfCheck: 'Mắt bạn lượn theo trình tự nào trong ảnh — và cuối cùng dừng ở đâu?',
    },
    {
      title: 'Chi tiết có đang phục vụ câu chuyện không',
      summary: 'Chi tiết đẹp chỉ có giá trị khi nó giúp ảnh mạnh hơn.',
      lookAt: 'Kiểm tra các chi tiết như cây, xe, người, furniture, props (đồ trang trí), material detail, reflection, sky, chim, đèn. Mỗi thứ có đang hỗ trợ câu chuyện không?',
      cue: 'Junior artist hay bị "detail trap" (mải sửa chi tiết nhỏ): càng sửa nhiều chi tiết nhỏ, ảnh càng rối nếu hướng đi chính chưa rõ.',
      common: 'Thêm người / xe cho đầy nhưng không có mục đích; cây che kiến trúc; reflection quá nổi; material chi tiết nhưng không ai nhìn vào hero.',
      fix: 'Xóa hoặc làm mềm chi tiết không cần thiết. Chỉ giữ những yếu tố giúp scale (tỉ lệ), lifestyle, depth (chiều sâu), mood hoặc storytelling.',
      selfCheck: 'Nếu xóa 20% chi tiết phụ, ảnh có mạnh hơn hay yếu đi?',
    },
    {
      title: 'Mood có thống nhất không',
      summary: 'Camera, ánh sáng, material, entourage và color grading phải cùng phục vụ một mood.',
      lookAt: 'Đánh giá cảm xúc tổng thể: premium, calm (yên bình), resort, urban (đô thị), vibrant (sống động), family, cinematic, private, public, commercial hoặc institutional.',
      cue: 'Mood tốt không đến từ một yếu tố riêng lẻ. Nó là kết quả của time of day (thời gian trong ngày), sky, ánh sáng, material, activity, camera và post (hậu kỳ) cùng nói một ngôn ngữ.',
      common: 'Ánh sáng luxury nhưng entourage quá casual; sky dramatic nhưng project cần calm; color grading lạnh nhưng material muốn ấm; activity không khớp loại công trình.',
      fix: 'Chọn mood chính trước. Sau đó cân lại sky, time of day, hướng ánh sáng, saturation, contrast, entourage và color grading (chỉnh màu tổng thể) để mọi thứ đi cùng nhau.',
      selfCheck: 'Nếu mỗi yếu tố đang nói một mood khác nhau, mood "chính" của ảnh là gì?',
    },
  ],
  villa: [
    {
      title: 'Villa đang bán lifestyle gì?',
      summary: 'Villa cần bán cảm giác sống, riêng tư và cao cấp, không chỉ facade đẹp.',
      lookAt: 'Xem ảnh đang nhấn vào điều gì: private luxury, arrival moment, garden living, pool lifestyle, indoor-outdoor connection hay architectural identity.',
      cue: 'Một ảnh villa mạnh thường khiến người xem tưởng tượng được "sống ở đây sẽ như thế nào".',
      common: 'Chỉ show mặt tiền nhưng thiếu lifestyle; cây và xe lấn át kiến trúc; interior quá tối; landscape chỉ là filler; entry không rõ.',
      fix: 'Làm rõ arrival, garden, balcony, terrace, warm interior light hoặc foreground mềm. Giữ chi tiết phụ lùi xuống để villa là hero.',
      selfCheck: 'Nếu phải tả lifestyle này trong 1 câu, mình sẽ tả sao?',
    },
    {
      title: 'Privacy & premium hierarchy',
      summary: 'Cảm giác riêng tư và premium phải đọc được qua layering và ánh sáng.',
      lookAt: 'Nhìn gate, setback, cây, balcony, window glow, landscape layer và khoảng cách từ đường vào nhà.',
      cue: 'Luxury villa không nên cảm giác phơi toàn bộ ra đường. Nó cần có lớp đệm và sự kiểm soát thị giác.',
      common: 'Nhà nhìn quá lộ, gate/cây không tạo privacy, foreground rối, xe quá nổi, ánh sáng không tạo cảm giác high-end.',
      fix: 'Tổ chức lại layer cây, gate, foreground, shadow và light focus để tạo cảm giác private nhưng vẫn khoe được architecture.',
      selfCheck: 'Villa có cảm giác đang được "khoe" hay "bộc lộ một cách tinh tế"?',
    },
    {
      title: 'Indoor-outdoor connection',
      summary: 'Villa mạnh khi không gian sống liên thông với cảnh quan.',
      lookAt: 'Quan hệ giữa nội thất, sân vườn, terrace, pool và facade có được thể hiện không?',
      cue: 'Villa mạnh khi người xem cảm thấy không gian sống liên thông với cảnh quan.',
      common: 'Kính quá đen, interior không đọc được, garden chỉ là filler, pool không đóng vai trò.',
      fix: 'Cân lại glass, interior light, reflection, landscape layering và camera height.',
      selfCheck: 'Người xem có cảm được sự liên thông giữa nhà và sân / landscape không?',
    },
  ],
  shophouse: [
    {
      title: 'Commercial frontage là hero',
      summary: 'Tầng trệt và shopfront là hero — không phải tầng trên.',
      lookAt: 'Tầng trệt, mặt tiền kinh doanh, signage và cửa hàng có đọc rõ không?',
      cue: 'Shophouse phải cho thấy khả năng kinh doanh và sức hút từ pedestrian level.',
      common: 'Facade tầng trên đẹp nhưng tầng trệt chết, signage yếu, không có hoạt động, shopfront bị tối.',
      fix: 'Tăng activity, chỉnh light tầng trệt, làm rõ signage, mở view vào shopfront.',
      selfCheck: 'Khi nheo mắt, tầng trệt có nổi hơn upper facade không?',
    },
    {
      title: 'Street activity hỗ trợ thương mại',
      summary: 'Activity phải hỗ trợ thương mại, không làm rối hero.',
      lookAt: 'Người đi bộ, xe, cây xanh, ánh sáng và storefront có tạo cảm giác tuyến phố đang sống không?',
      cue: 'Activity phải hỗ trợ scale và thương mại, không làm rối hero.',
      common: 'Entourage quá ít hoặc quá nhiều, người sai scale, phố trống, hoạt động không tự nhiên.',
      fix: 'Điều chỉnh mật độ người/xe, vị trí entourage, shadow contact và visual flow.',
      selfCheck: 'Có người / xe nào đang tranh attention với storefront không?',
    },
    {
      title: 'Rhythm of facade có depth',
      summary: 'Nhịp lặp phải có depth và identity, không đều đến mất cá tính.',
      lookAt: 'Nhịp mặt đứng shophouse có rõ, đồng bộ nhưng không đơn điệu không?',
      cue: 'Tuyến shophouse cần đọc được repetition, depth và identity.',
      common: 'Mặt tiền phẳng, thiếu depth, các căn lặp cứng, không có điểm nhấn.',
      fix: 'Dùng camera angle, shadow, awning, signage, balcony hoặc light để tạo nhịp.',
      selfCheck: 'Có điểm nhấn nào để mắt dừng, hay tuyến chỉ trải đều?',
    },
  ],
  townhouse: [
    {
      title: 'Nhịp tuyến nhà có biến tấu',
      summary: 'Nhịp lặp phải có biến tấu, không lặp như masterplan in.',
      lookAt: 'Các căn townhouse có tạo được nhịp phố rõ ràng và có trật tự không?',
      cue: 'Townhouse cần balance giữa tính đồng bộ và sự sống động.',
      common: 'Lặp quá máy móc, không có điểm nghỉ mắt, tuyến nhà bị phẳng.',
      fix: 'Tạo depth bằng camera angle, landscape, lighting, variation nhẹ và foreground.',
      selfCheck: 'Tuyến này có khiến người xem muốn sống ở đây, hay chỉ là dãy nhà?',
    },
    {
      title: 'Scale khu ở thân thiện',
      summary: 'Scale phải thân thiện, không hoành tráng quá hoặc lạnh quá.',
      lookAt: 'Ảnh có cho cảm giác scale thân thiện, đúng với khu dân cư không?',
      cue: 'Townhouse nên có cảm giác sống được, không quá hoành tráng như resort hoặc quá lạnh như masterplan.',
      common: 'Người/xe sai scale, vỉa hè quá trống, cây xanh không hỗ trợ, street furniture thiếu.',
      fix: 'Thêm scale cues, chỉnh height camera, bổ sung pedestrian activity và landscape layer.',
      selfCheck: 'Nếu có người 1.7m đứng trước nhà, scale có hợp không?',
    },
    {
      title: 'Facade identity rõ nhưng đồng bộ',
      summary: 'Identity phải nổi mà vẫn cùng một ngôn ngữ với cả tuyến.',
      lookAt: 'Ngôn ngữ facade có rõ cá tính nhưng vẫn thuộc cùng một tổng thể không?',
      cue: 'Người xem cần nhớ được identity của tuyến nhà sau khi nhìn ảnh.',
      common: 'Facade bị chìm, tone material đều đều, không có điểm nhấn.',
      fix: 'Tăng hierarchy bằng ánh sáng, material contrast, shadow depth hoặc crop.',
      selfCheck: 'Sau khi đóng ảnh, người xem có nhớ được nét đặc trưng nào không?',
    },
  ],
  'public-landscape': [
    {
      title: 'Trải nghiệm người dùng đọc rõ',
      summary: 'Phải thấy con người dùng không gian, không phải landscape trang trí.',
      lookAt: 'Ảnh có cho thấy con người sử dụng không gian như thế nào không?',
      cue: 'Landscape công cộng không chỉ là cây đẹp; phải thấy được flow, điểm dừng, hoạt động và comfort.',
      common: 'Không gian trống, người đặt cho có, thiếu điểm tụ, hoạt động không rõ.',
      fix: 'Bố trí activity theo zone, thêm seating, walking flow, group interaction và shadow comfort.',
      selfCheck: 'Có hoạt động cụ thể nào trong ảnh đáng nhớ không?',
    },
    {
      title: 'Flow di chuyển dẫn mắt',
      summary: 'Đường đi và trục nhìn phải đọc rõ, dẫn mắt vào điểm đến.',
      lookAt: 'Đường đi, trục nhìn, lối vào và điểm đến có đọc rõ không?',
      cue: 'Mắt người xem nên đi theo cùng logic với người dùng trong không gian.',
      common: 'Path bị rối, focal point yếu, cây/entourage che trục chính.',
      fix: 'Chỉnh framing, làm rõ path, giảm clutter và dùng light để nhấn route.',
      selfCheck: 'Mắt mình tự nhiên đi đâu trong ảnh — đúng nơi mình muốn không?',
    },
    {
      title: 'Shade, comfort & atmosphere',
      summary: 'Cảm giác dễ chịu phải đến từ shade, light và material — không chỉ từ cây.',
      lookAt: 'Ảnh có truyền được cảm giác dễ chịu: bóng mát, gió, vật liệu, social comfort không?',
      cue: 'Không gian công cộng tốt phải khiến người xem muốn ở lại.',
      common: 'Nắng quá gắt, thiếu shade, cây không tạo vai trò, người đứng sai vùng comfort.',
      fix: 'Cân lại time of day, shadow, tree placement, seating và color temperature.',
      selfCheck: 'Nhìn ảnh, mình có muốn ngồi xuống đó không?',
    },
  ],
  park: [
    {
      title: 'Landmark / focal moment',
      summary: 'Park cần điểm nhớ — pavilion, lake, plaza, sculpture.',
      lookAt: 'Công viên có một khoảnh khắc hoặc điểm nhấn đáng nhớ không?',
      cue: 'Park cần có memory point: pavilion, lake, playground, plaza, sculpture hoặc canopy.',
      common: 'Chỉ thấy cây và đường đi, không có điểm dừng thị giác.',
      fix: 'Tăng vai trò landmark, chỉnh camera, mở view corridor hoặc thêm activity quanh focal point.',
      selfCheck: 'Nếu kể về park này, người xem sẽ nhớ điểm gì?',
    },
    {
      title: 'Layering cảnh quan',
      summary: 'Cảnh quan cần lớp, không phủ cây đều khắp ảnh.',
      lookAt: 'Foreground, midground, background có tạo chiều sâu và nhịp cảnh quan không?',
      cue: 'Landscape đẹp cần layer rõ, không phải phủ cây đều khắp ảnh.',
      common: 'Cây bị đều, thiếu depth, foreground che quá nhiều, background trống.',
      fix: 'Tổ chức lại planting layer, path, lighting, camera height và depth cue.',
      selfCheck: 'Có lớp foreground / mid / background đọc được không?',
    },
    {
      title: 'Human scale & activity',
      summary: 'Người trong ảnh phải đúng scale và đúng hoạt động cho không gian.',
      lookAt: 'Con người trong công viên có đúng scale, đúng hoạt động và đúng mood không?',
      cue: 'Activity phải làm không gian đáng tin, không được giống asset rải ngẫu nhiên.',
      common: 'Người sai scale, activity không phù hợp, group bị rối, thiếu shadow contact.',
      fix: 'Chọn entourage đúng bối cảnh, chỉnh scale, vị trí, shadow và density.',
      selfCheck: 'Activity có khớp với loại không gian không, hay chỉ là asset rải?',
    },
  ],
  'street-view': [
    {
      title: 'Urban rhythm có chiều sâu',
      summary: 'Tuyến phố phải có nhịp đô thị rõ, đọc được chiều sâu.',
      lookAt: 'Tuyến phố có nhịp đô thị rõ: facade, cây, đèn, vỉa hè, người và xe không?',
      cue: 'Street view mạnh khi mắt cảm được nhịp lặp và chiều sâu của tuyến.',
      common: 'Phố phẳng, thiếu depth, các block không liên kết, traffic/people rời rạc.',
      fix: 'Dùng camera angle, focal length, shadow, street furniture và entourage để tạo nhịp.',
      selfCheck: 'Mắt có cảm được nhịp lặp của facade và cây dọc tuyến không?',
    },
    {
      title: 'Pedestrian scale có sự sống',
      summary: 'Vỉa hè phải có sự sống, không chỉ đẹp từ xa.',
      lookAt: 'Vỉa hè, shopfront, cây, người đi bộ có tạo cảm giác thân thiện không?',
      cue: 'Nếu street view chỉ đẹp từ xa nhưng không có human scale, ảnh sẽ thiếu sức sống.',
      common: 'Vỉa hè trống, người sai scale, storefront không đọc được, cây che sai chỗ.',
      fix: 'Tăng pedestrian activity, chỉnh scale cues, mở tầng trệt và giảm clutter.',
      selfCheck: 'Nếu mình đi bộ ở đây, có cảm giác thân thiện không?',
    },
    {
      title: 'Depth & perspective dẫn mắt',
      summary: 'Perspective phải dẫn mắt vào tuyến, không bị fisheye.',
      lookAt: 'Perspective có dẫn mắt vào tuyến phố và tạo chiều sâu không?',
      cue: 'Đường phố cần vanishing direction rõ nhưng không bị méo quá mạnh.',
      common: 'Fisheye, vertical nghiêng, compression sai, tuyến phố bị cụt.',
      fix: 'Chỉnh focal length, camera height, two-point perspective, crop và foreground anchor.',
      selfCheck: 'Vanishing point có rõ và phục vụ câu chuyện không?',
    },
  ],
  interior: [
    {
      title: 'Spatial experience',
      summary: 'Người xem phải hiểu không gian và muốn bước vào.',
      lookAt: 'Ảnh có làm người xem hiểu được không gian, circulation và điểm nhấn nội thất không?',
      cue: 'Interior tốt phải cho cảm giác muốn bước vào, không chỉ là render đồ nội thất.',
      common: 'Góc máy quá rộng, méo không gian, hero nội thất không rõ, layout khó đọc.',
      fix: 'Chỉnh camera height, focal length, framing, foreground và light focus.',
      selfCheck: 'Sau khi nhìn ảnh, mình có biết phòng này dùng để làm gì không?',
    },
    {
      title: 'Material mood thống nhất',
      summary: 'Material phải cùng một mood — không bị rối tone.',
      lookAt: 'Material, ánh sáng và decor có cùng một mood không?',
      cue: 'Interior phụ thuộc nhiều vào subtle material response: vải, gỗ, đá, kim loại, kính.',
      common: 'Material không cùng tone, roughness sai, decor quá nổi, ánh sáng không hỗ trợ.',
      fix: 'Cân lại material palette, roughness, light temperature, contrast và color grading.',
      selfCheck: 'Nếu đặt 3 tone material chính, chúng có cùng câu chuyện không?',
    },
    {
      title: 'Lifestyle & usability có sự sống',
      summary: 'Ảnh phải gợi lifestyle thật, không như showroom.',
      lookAt: 'Không gian có cảm giác thật sự được sử dụng không?',
      cue: 'Entourage, styling và ánh sáng phải gợi lifestyle mà không làm ảnh giả.',
      common: 'Styling quá showroom, vật dụng đặt ngẫu nhiên, thiếu scale cues, không có điểm sống.',
      fix: 'Tinh chỉnh props, scale, fabric detail, warm light, shadow contact và visual story.',
      selfCheck: 'Nếu ai đó đang sống ở đây, họ có để lại dấu vết gì trong ảnh?',
    },
  ],
}

const PHASES = [
  {
    id: 'storytelling',
    number: '00',
    name: 'Storytelling',
    intent:
      'Định hướng câu chuyện của ảnh trước khi check kỹ thuật. Mục tiêu là xác định hero, thông điệp chính, mood và thứ tự mắt người xem đi qua ảnh.',
    guides: [],
    items: [],
  },
  {
    id: 'camera',
    number: '1',
    name: 'Camera & Composition',
    intent:
      'Xác nhận camera khớp hướng đã duyệt và bố cục đọc rõ ràng. Dùng guide để verify framing, balance và visual flow.',
    guides: [
      { id: 'thirds', label: 'Rule of Thirds', kind: 'composition' },
      { id: 'center', label: 'Center Lines', kind: 'composition' },
      { id: 'safe', label: 'Safe Frame', kind: 'composition' },
      { id: 'diagonal', label: 'Diagonals', kind: 'composition' },
      { id: 'golden', label: 'Golden Ratio', kind: 'composition' },
      { id: 'spiral', label: 'Golden Spiral', kind: 'composition' },
    ],
    items: [
      {
        title: 'Góc camera khớp hướng đã duyệt',
        summary: 'Camera phải đặt đúng vị trí và đúng hướng đã duyệt với client.',
        lookAt: 'So sánh góc render với reference, moodboard hoặc still đã được duyệt từ trước.',
        cue: 'Đứng lùi khỏi màn hình. Công trình đọc ngay từ ánh nhìn đầu có giống lúc duyệt brief không?',
        common: 'Camera lệch trục, lens quá rộng làm bóp méo công trình, vantage point (vị trí đặt camera) khác với hướng đã duyệt.',
        fix: 'Đưa camera về đúng setup đã duyệt: focal length (độ rộng / hẹp của ống kính) và target (điểm camera nhìn vào) không nên tự ý đổi nếu chưa có lý do. Lock camera sau khi đã xác nhận.',
        selfCheck: 'Nếu mở reference đã duyệt cạnh ảnh hiện tại, hai cái có khớp về angle và proportion không?',
      },
      {
        title: 'Bố cục cân bằng',
        summary: 'Trọng lượng thị giác phải cân giữa các vùng trong khung hình.',
        lookAt: 'Xem cách phân bố trọng lượng giữa foreground (lớp phía trước), khối công trình, sky và entourage (người, xe, cây).',
        cue: 'Hình dung nghiêng ảnh — có góc nào tự nhiên thấy trống hoặc nặng không?',
        common: 'Sky chiếm quá nhiều, đường horizon (chân trời) lệch, hero bị đẩy ra góc, foreground trống không có gì đỡ.',
        fix: 'Dựng khung hình lại, chỉnh crop (cắt khung), thêm foreground anchor (vật ở phía trước để neo bố cục) hoặc đổi vantage point để cân lại trọng lượng.',
        selfCheck: 'Nếu chia ảnh thành 4 góc đều nhau, có góc nào quá nặng hoặc quá trống so với phần còn lại không?',
      },
      {
        title: 'Đường thẳng đứng được kiểm soát',
        summary: 'Các đường vertical (thẳng đứng) của kiến trúc phải đứng thẳng, không nghiêng.',
        lookAt: 'Các cạnh đứng của công trình — cột, mullion (thanh chia kính), parapet (lan can mái), góc nhà.',
        cue: 'Đường vertical kiến trúc phải song song với mép khung hình, trừ khi méo có chủ đích.',
        common: 'Vertical bị hội tụ về đỉnh (keystoning), tilt-shift (chỉnh perspective trong camera) sai, two-point perspective (camera 2 điểm tụ) bị vỡ.',
        fix: 'Bật two-point perspective trên camera, hoặc dùng tilt-shift correction trong post (chỉnh sau render). Nếu vertical vẫn nghiêng, fix bằng warp / transform.',
        selfCheck: 'Đặt thước thẳng đứng cạnh màn hình — các cột công trình có song song với thước không?',
      },
      {
        title: 'Focal length tự nhiên',
        summary: 'Focal length (độ rộng / hẹp của ống kính) phải cho cảm giác tự nhiên, không méo.',
        lookAt: 'Cảm giác phối cảnh — công trình có bị méo, kéo dài hoặc phình to bất thường không?',
        cue: 'Ống 24mm dễ làm cảm giác cường điệu; 28–50mm equivalent thường gần với cách kiến trúc sư chụp ảnh thật.',
        common: 'Cảm giác fisheye (ống mắt cá quá rộng) với 14–18mm, view xa thiếu compression (nén phối cảnh), méo ở cạnh ảnh.',
        fix: 'Tăng focal length lên 28–50mm equivalent, hoặc lùi camera ra xa và dựng khung hình lại.',
        selfCheck: 'Nếu tưởng tượng đứng tại vị trí camera ngoài đời, mắt mình có thấy công trình giống thế này không?',
      },
      {
        title: 'Hero (điểm chính cần khoe) đọc rõ',
        summary: 'Hero — entry, facade signature, material story — phải nổi lên trước cây, xe, người và sky.',
        lookAt: 'Xác định hero của project: entry (lối vào), facade signature (mặt tiền đặc trưng) hay material story (câu chuyện vật liệu). Sau đó kiểm tra hero có đọc rõ trong ảnh không.',
        cue: 'Nheo mắt hoặc thu nhỏ ảnh: hero có còn là điểm bắt mắt nhất khi chi tiết bị mờ đi không?',
        common: 'Hero bị entourage (người, xe, cây) che; bị sky lấn vì thiếu contrast (tương phản sáng tối); hoặc bị foreground (lớp phía trước) nuốt mất.',
        fix: 'Dời entourage, bỏ bớt cây, thêm rim light (ánh sáng viền) cho hero, hoặc dựng lại khung hình để lộ hero.',
        selfCheck: 'Nếu in ảnh ở kích thước nhỏ bằng bao thuốc, hero có còn nhận ra được không?',
      },
      {
        title: 'Foreground, midground, background đọc rõ',
        summary: 'Ba lớp chiều sâu — foreground, midground, background — phải tách lớp rõ.',
        lookAt: 'Phân tách chiều sâu — separation về tone (sắc độ), color hoặc detail giữa foreground (lớp trước), midground (lớp giữa), background (lớp nền).',
        cue: 'Che 1/3 ảnh từng phần. Mỗi layer vẫn phải đọc được riêng biệt khi nhìn riêng.',
        common: 'Depth phẳng, các layer hòa vào một tone, thiếu atmospheric perspective (mờ dần theo chiều xa), không có foreground anchor.',
        fix: 'Thêm haze (sương / mờ khoảng cách) cho background, tăng value contrast (tương phản sáng tối) giữa các layer, đặt thêm element foreground.',
        selfCheck: 'Nếu chỉ giữ 1 layer (foreground / midground / background), layer đó có còn đứng vững không?',
      },
    ],
  },
  {
    id: 'material',
    number: '2',
    name: 'Material & Lighting',
    intent:
      'Kiểm tra độ chân thật của surface, hướng ánh sáng và cân bằng tone. Soi material scale, behavior reflection và color temperature có nhất quán không.',
    guides: [
      { id: 'mat-zones', label: 'Material Focus', kind: 'hint', hint: 'Quét lần lượt sàn, tường, kính, trần — từng surface một.' },
      { id: 'shadow-hi', label: 'Shadow / Highlight', kind: 'hint', hint: 'Tập trung vào shadow transition và highlight rolloff — lỗi lighting hay ẩn ở đó.' },
      { id: 'reflection', label: 'Reflection Check', kind: 'hint', hint: 'Soi bề mặt glossy và reflective — hướng, độ sắc và phản chiếu object xung quanh.' },
      { id: 'tex-scale', label: 'Texture Scale', kind: 'hint', hint: 'Tưởng tượng người 1.7m đứng cạnh gỗ, đá, vải — scale có đúng không?' },
      { id: 'warm-cool', label: 'Warm / Cool Balance', kind: 'hint', hint: 'Sky vs ánh sáng nội thất vs sunlight — temperature phải support mood, không chống lại.' },
    ],
    items: [
      {
        title: 'Material chính khớp reference',
        summary: 'Material trong ảnh phải khớp đúng reference đã duyệt.',
        lookAt: 'Từng surface chính (sàn, tường, mái, kính, kim loại) so với material spec hoặc reference đã duyệt.',
        cue: 'Đi qua ảnh từng surface một. Dừng ở chỗ không khớp brief và tự hỏi vì sao.',
        common: 'Tone gỗ sai, concrete generic thay vì polished, thiếu variation, sai loại đá.',
        fix: 'Đổi từ material library đã duyệt, chỉnh albedo (màu gốc của material), mở reference và tinh chỉnh lại.',
        selfCheck: 'Nếu đặt swatch material đã duyệt cạnh ảnh, có khớp tone và texture không?',
      },
      {
        title: 'Texture scale & mapping',
        summary: 'Texture (vân vật liệu) và UVW mapping (cách texture bám lên model) phải đúng tỉ lệ thực tế.',
        lookAt: 'Các bề mặt lớn — sàn, đá, gỗ, facade panel, vải, tường.',
        cue: 'Tự hỏi texture có còn believable nếu có người 1.7m đứng cạnh không. Sai scale và stretched UV (texture bị kéo giãn) nhìn ra ngay.',
        common: 'Vân gỗ quá to, đá quá nhỏ, UV bị stretch (kéo giãn), seam (đường nối) lộ rõ, lặp tiling.',
        fix: 'Chỉnh UVW scale, rotation (xoay UV), randomization (làm ngẫu nhiên), dùng triplanar mapping (texture 3 trục), hoặc thay texture chất lượng cao hơn.',
        selfCheck: 'Nếu tưởng tượng đặt một viên gạch / một thớ gỗ thật cạnh material trong ảnh, kích thước có khớp không?',
      },
      {
        title: 'Không bị tiling hoặc stretching lộ rõ',
        summary: 'Bề mặt lặp lại không nên để lộ pattern.',
        lookAt: 'Bề mặt phẳng lặp lại — pavement (lát đường), panel facade lớn, trần, tường.',
        cue: 'Pattern không nên hút mắt. Nếu mình nhìn ra sự lặp lại, client cũng sẽ nhìn ra.',
        common: 'Lặp motif rõ, mirrored seam (đường nối đối xứng), UV stretch ở góc, banding.',
        fix: 'Tăng resolution texture, randomize UV offset / rotation từng element, dùng procedural variation (biến tấu programmatic).',
        selfCheck: 'Nhìn lướt qua các surface lớn — có vùng nào pattern lặp đập vào mắt không?',
      },
      {
        title: 'Hướng ánh sáng phù hợp với scene',
        summary: 'Hướng ánh sáng phải nhất quán và làm rõ kiến trúc.',
        lookAt: 'Sun azimuth (góc xoay theo phương ngang) và elevation (góc cao của mặt trời), key light (đèn chính) vs fill (đèn phụ), hướng shadow (bóng đổ) toàn scene.',
        cue: 'Trace một shadow ngược về nguồn sáng. Nguồn đó có nhất quán với mọi shadow khác không?',
        common: 'Shadow conflict hướng (bóng đổ ngược nhau), sun quá đỉnh đầu hoặc quá flat, fill light quá mạnh giết depth (chiều sâu).',
        fix: 'Đổi giờ sun, cân lại fill / ambient (đèn nền), thêm rim light (ánh viền) hoặc back light (đèn ngược) để lộ form công trình.',
        selfCheck: 'Nếu bạn đặt một viên đá trên sàn, bóng của nó sẽ đổ về hướng nào — có khớp với các shadow trong ảnh không?',
      },
      {
        title: 'Exposure & contrast cân bằng',
        summary: 'Exposure (độ sáng tổng thể) không bị clip và contrast (tương phản) đủ depth.',
        lookAt: 'Pixel tối nhất và sáng nhất. Highlight (vùng sáng mạnh) không nên bị blown (cháy trắng), shadow (vùng tối) không nên bị crushed (đen kịt).',
        cue: 'Nheo mắt. Có vùng trắng pure hoặc đen pure đang nuốt detail mà mình muốn giữ không?',
        common: 'Highlight clip ở kính / sky, shadow detail bị crushed (mất chi tiết), midtone phẳng, contrast thấp.',
        fix: 'Chỉnh exposure, tone-mapping curve, raise shadows (kéo vùng tối lên), recover highlights (kéo vùng sáng xuống) trong post.',
        selfCheck: 'Có vùng nào đáng lẽ thấy chi tiết nhưng giờ chỉ thấy trắng hoặc đen không?',
      },
      {
        title: 'Reflection & roughness chân thật',
        summary: 'Reflection (phản chiếu) và roughness (độ nhám / bóng) phải đúng cảm giác thực tế.',
        lookAt: 'Kính, sàn polish, panel kim loại, mặt nước.',
        cue: 'Reflection phải khớp với object xung quanh về vị trí và độ mềm. Bề mặt rough (nhám) phải tán sáng, không soi gương.',
        common: 'Concrete bị mirror-glossy (bóng như gương), reflection lệch khỏi environment, blurry chỗ phải sharp.',
        fix: 'Tune roughness map (bản đồ độ nhám), fix reflection environment (môi trường phản chiếu), verify IOR (chỉ số khúc xạ ánh sáng), tăng reflection samples.',
        selfCheck: 'Nếu chạm thử bề mặt đó ngoài đời, cảm giác có giống ảnh không (nhẵn / nhám / bóng)?',
      },
    ],
  },
  {
    id: 'render',
    number: '3',
    name: 'Render Quality',
    intent:
      'Săn lỗi kỹ thuật và pass render thiếu. Soi ở 100% chú ý noise, fireflies, cạnh và geometry thiếu.',
    guides: [
      { id: 'zoom-100', label: '100% Zoom', kind: 'hint', hint: 'Soi ở 1:1 — fullscreen giúp. Pan và scan có hệ thống, đừng liếc.' },
      { id: 'noise', label: 'Noise Check', kind: 'hint', hint: 'Góc tối, reflection glossy, kính, shadow transition — nơi noise hay ẩn.' },
      { id: 'edge', label: 'Edge Check', kind: 'hint', hint: 'Silhouette object, geometry mảnh, khe hair-line. Coi chừng stair-stepping.' },
      { id: 'contact', label: 'Contact Shadow', kind: 'hint', hint: 'Chỗ object gặp sàn hoặc tường — coi chừng object bay hoặc thiếu AO.' },
      { id: 'artifact', label: 'Artifact Scan', kind: 'hint', hint: 'Splotch, banding, light leak, pass merge sai bất kỳ chỗ nào trên ảnh.' },
    ],
    items: [
      { title: 'Noise, fireflies & sampling', lookAt: 'Vùng tối, reflection glossy, kính, shadow transition, khu vực interior.', cue: 'Xem ảnh ở 100% zoom và quét từ các góc về focal point. Noise hay nằm ở vùng tối và reflection.', common: 'Fireflies, reflection grainy, kính bị hạt, shadow nhìn bẩn, denoise quá mạnh làm soft chi tiết.', fix: 'Tăng samples, cải thiện light setup, clamp highlight, chỉnh denoise hoặc render lại pass có vấn đề.' },
      { title: 'Cạnh và chi tiết nhỏ sạch', lookAt: 'Silhouette của geometry mảnh — railing, mullion, vegetation, chi tiết hair-line.', cue: 'AA fail thường thấy là stair-stepping hoặc fizzling dọc theo cạnh contrast cao.', common: 'Cạnh bị aliased, jaggy ở đường chéo, AA thiếu trên geometry mảnh.', fix: 'Tăng AA samples, raise filter quality, render ở resolution cao hơn rồi downsample.' },
      { title: 'Reflection, kính & shadow đúng behavior', lookAt: 'Mullion kính, panel kim loại, mặt nước, contact shadow dưới object.', cue: 'Reflection neo object vào environment; shadow ground chúng. Cả hai phải đọc được.', common: 'Kính đen, thiếu reflection environment, không có contact shadow dưới furniture, shadow lệch hướng.', fix: 'Thêm HDRI hoặc reflection probe, tăng glass refraction depth, enable shadow rays đúng.' },
      { title: 'Không có geometry thiếu hoặc object bay', lookAt: 'Khe hở giữa element, object không chạm sàn, tường thấu, vấn đề intersection.', cue: 'Object bay đọc ra ngay là render bug. Tường thấu thì phá immersion.', common: 'Furniture bay trên sàn, panel facade hở, thiếu trần, object thụt vào sàn.', fix: 'Snap to grid hoặc surface, thêm geometry sàn ẩn, verify scene so với model.' },
      { title: 'Render resolution khớp deliverable', lookAt: 'Output dimensions so với spec — print, web, hero shot.', cue: 'Print thường ~300 DPI ở size deliver; hero web hay là 3840px wide. Check brief.', common: 'Deliver ở preview resolution, sai aspect ratio, scale up từ render thấp.', fix: 'Render lại đúng resolution natively. Không upscale.' },
      { title: 'Không có render artifact lộ rõ', lookAt: 'Toàn ảnh — splotch, banding, light leak, pass bị merge sai.', cue: 'Liếc qua ảnh tổng một lần, sau đó tile-scan nếu có gì thấy lạ.', common: 'Light leak ở seam material, banding ở sky, GI splotchy, ghost reflection.', fix: 'Tune GI settings, tăng samples ở pass có vấn đề, fix UV seam của material.' },
    ],
  },
  {
    id: 'post',
    number: '4',
    name: 'Post Production & Final Delivery',
    intent:
      'Đánh giá ảnh cuối như một tác phẩm hoàn chỉnh. Check grade unity, sharpening sanity, entourage believability và delivery hygiene.',
    guides: [
      { id: 'grade', label: 'Color Grade', kind: 'hint', hint: 'Nheo mắt hoặc thu nhỏ. Ảnh phải đọc thành một mood, không phải các phần edit rời.' },
      { id: 'sharpen', label: 'Over-sharpening', kind: 'hint', hint: 'Halo quanh cạnh contrast cao và texture sạn = unsharp mask quá tay.' },
      { id: 'entourage', label: 'Entourage Integration', kind: 'hint', hint: 'Hướng ánh sáng, scale, contact shadow, color temperature trên người và cây.' },
      { id: 'crop', label: 'Border / Crop', kind: 'hint', hint: 'Aspect ratio, safe area, element bị clip ở cạnh.' },
      { id: 'export', label: 'Export Safety', kind: 'hint', hint: 'Filename, format, color space, resolution, embedded profile.' },
    ],
    items: [
      { title: 'Color grading & mood consistency', lookAt: 'Mood tổng — white balance, contrast, saturation, sky vs công trình vs landscape vs ánh sáng nội thất.', cue: 'Nheo mắt hoặc thu nhỏ ảnh. Phải đọc được như một mood thống nhất, không cảm giác ghép từng phần.', common: 'Ám màu, grade quá nóng hoặc quá lạnh, không nhất quán giữa view set, greens quá saturated, black bị crushed.', fix: 'Cân lại white point, giảm saturation, chỉnh contrast curve, so với reference đã approved.' },
      { title: 'Sharpening sanity check', lookAt: 'Cạnh contrast cao — đường facade, outline foliage, text/signage.', cue: 'Sharpening quá tay tạo halo và texture sạn. Ảnh phải feel crisp, không crunchy.', common: 'Halo quanh mullion, foliage sạn, concrete oversharpened, ringing trên cạnh.', fix: 'Giảm unsharp mask amount/radius, mask sharpening khỏi sky và bề mặt mịn.' },
      { title: 'Entourage integration', lookAt: 'People, vegetation, vehicles. Check hướng ánh sáng, scale, contact shadow, color temperature.', cue: 'Entourage phải feel như được chụp trong cùng scene, không phải dán vào sau.', common: 'Entourage bị lit sai hướng, không có contact shadow, sai color temperature, scale lệch, người lặp lại.', fix: 'Xoay entourage, thêm cast shadow dưới mỗi cái, color-grade khớp, scale với reference biết trước.' },
      { title: 'Border, crop & safe area', lookAt: 'Bốn cạnh và bốn góc ảnh. Aspect ratio khớp với spec deliverable.', cue: 'Element bị clip ở cạnh sẽ làm viewer phân tâm ngay.', common: 'Người hoặc object bị crop ở cạnh, sky quá cao, công trình bị cắt, sai aspect ratio.', fix: 'Re-crop, extend canvas bằng paint, hoặc render lại đúng aspect ratio.' },
      { title: 'Comment client đã xử lý', lookAt: 'Markup hoặc note review mới nhất từ client. Đi qua từng comment và verify đã giải quyết.', cue: 'Đừng tin trí nhớ — mở file markup. Comment chưa xử lý sẽ quay lại thành revision round.', common: 'Comment chỉ xử lý một phần, fix nhầm view, đọc nhầm comment.', fix: 'Tick từng comment trong tài liệu review, screenshot before/after để confirm.' },
      { title: 'Export hygiene (file, format, profile, resolution)', lookAt: 'Filename, format, color profile, resolution so với spec deliverable.', cue: 'Đây là cổng cuối trước khi gửi. Sai filename hoặc sRGB-vs-Adobe RGB sẽ bị client bắt.', common: 'Sai filename, JPG khi yêu cầu TIFF, thiếu color profile, sai resolution, embedded preview chất lượng thấp.', fix: 'Rename theo spec, re-export đúng format và profile, double-check brief.' },
      {
        title: 'Tone, white balance & độ căng ảnh',
        summary: 'Cân lại nền tone cho sạch trước khi chỉnh màu sáng tạo. Ảnh phải có lực mà không bị gắt.',
        lookAt: 'Nhìn vùng trắng (tường, trần, đá sáng), highlight (vùng sáng mạnh), shadow (vùng tối), midtone (vùng sáng trung bình) của công trình. Sau đó kiểm tra sự hòa hợp màu giữa sky, landscape, kiến trúc và ánh sáng nội thất.',
        cue: 'Ảnh "căng" không có nghĩa là kéo contrast (độ tương phản) thật mạnh. Ảnh căng là khi vùng sáng sạch, vùng tối có chiều sâu, midtone rõ và công trình chính nổi lên mà vẫn giữ được detail.',
        common: 'Ám vàng / xanh / magenta; tường trắng bị bẩn màu; shadow bệt mất chi tiết; highlight cháy trắng; ảnh flat (phẳng); contrast quá gắt; clarity / sharpen (làm nét) tạo halo (viền sáng giả).',
        fix: 'Cân white balance (cân bằng trắng), chỉnh levels / curves nhẹ, kiểm soát highlight, đặt lại black point (điểm đen) vừa đủ, tăng midtone contrast ở vùng chính. Tránh kéo contrast toàn ảnh quá mạnh.',
        selfCheck: 'Khi thu nhỏ ảnh, vùng trắng có còn cảm giác sạch và công trình có bật ra không?',
      },
    ],
  },
]

// Phase-specific Senior Review Lenses. Lens IDs are unique within a phase only;
// scores and active selection are namespaced by phase, so collisions across phases are safe.
const LENSES_BY_PHASE = {
  storytelling: [
    {
      id: 'story', label: 'Story', abbr: 'Sto', title: 'Story Lens',
      purpose: 'Kiểm tra ảnh có kể đúng câu chuyện chính của project không.',
      questions: [
        'Nhìn 3 giây đầu, bạn có hiểu ảnh muốn bán điều gì không?',
        'Câu chuyện chính có khớp với loại hình công trình không?',
        'Có yếu tố nào trong ảnh đang nói câu chuyện khác với hero (điểm chính cần khoe) không?',
        'Nếu xóa một câu story, ảnh có còn đứng vững không?',
      ],
    },
    {
      id: 'hero', label: 'Hero', abbr: 'Her', title: 'Hero Lens',
      purpose: 'Kiểm tra hero (điểm chính cần khoe) có đủ rõ và đủ lực hút không.',
      questions: [
        'Người xem có nhìn thấy hero trong 3 giây đầu không?',
        'Hero có đang bị cây, xe, người, sky hoặc foreground (lớp phía trước) lấn át không?',
        'Khi nheo mắt nhìn ảnh, hero còn nổi không?',
        'Hero có đúng với selling point (điểm bán chính) của loại công trình không?',
      ],
    },
    {
      id: 'hierarchy', label: 'Hierarchy', abbr: 'Hie', title: 'Hierarchy Lens',
      purpose: 'Kiểm tra visual hierarchy (thứ tự chính phụ trong ảnh) — chính / phụ / nền.',
      questions: [
        'Bạn có chỉ ra rõ 3 lớp: chính, phụ, nền không?',
        'Vùng phụ có biết lùi xuống không, hay đang đòi sự chú ý?',
        'Mắt người xem đi theo trình tự nào?',
        'Có vùng nào quá nặng làm ảnh mất balance không?',
      ],
    },
    {
      id: 'contrastBalance', label: 'Contrast & Balance', abbr: 'CB', title: 'Contrast & Balance Lens',
      purpose: 'Tương phản & cân bằng giữa kiến trúc và các yếu tố phụ. Cây, sky, mây, người, xe, props (đồ trang trí), foreground (lớp trước ảnh) và atmosphere phải tạo đối trọng phù hợp với kiến trúc — không chỉ để lấp chỗ trống. Đừng hỏi asset này có đẹp riêng lẻ không; hãy hỏi nó có làm công trình đúng tính cách hơn không. Yếu tố phụ tốt là yếu tố có vai trò: làm mềm khối cứng, tạo depth (chiều sâu), dẫn mắt, cho scale, tăng lifestyle hoặc làm hero (điểm chính cần khoe) nổi hơn.',
      questions: [
        'Kiến trúc chính đang có tính cách gì: mạnh, mềm, tối giản, classic, luxury, resort, urban hay commercial?',
        'Các yếu tố phụ đang cân bằng tính cách đó hay làm ảnh bị lệch mood (cảm xúc tổng thể)?',
        'Công trình nhiều đường thẳng / khối mạnh thì cây, mây, bóng đổ và foreground đã đủ mềm để cân bằng chưa?',
        'Nếu công trình nhiều chi tiết, các yếu tố phụ có đang được tiết chế để không tranh spotlight (sự chú ý chính) không?',
        'Cây, người, xe, sky hoặc props có đang hỗ trợ hero hay đang kéo mắt khỏi hero?',
        'Màu cây, màu trời, màu xe, outfit người và props có hòa vào palette (bảng màu tổng thể) không?',
        'Nếu bỏ một yếu tố phụ ra khỏi ảnh, ảnh sẽ yếu hơn hay sạch hơn?',
      ],
    },
    {
      id: 'mood', label: 'Mood', abbr: 'Moo', title: 'Mood Lens',
      purpose: 'Kiểm tra mood (cảm xúc tổng thể) có thống nhất và phù hợp project không.',
      questions: [
        'Camera, ánh sáng, material, entourage có cùng nói một mood không?',
        'Mood có đúng với selling brief (luxury, calm, urban, family...) không?',
        'Sky / time of day (thời gian trong ngày) có hỗ trợ mood không?',
        'Color grading (chỉnh màu tổng thể) có nâng mood hay phá mood?',
      ],
    },
    {
      id: 'distraction', label: 'Gây nhiễu', abbr: 'Dis', title: 'Distraction Lens',
      purpose: 'Tìm chi tiết đang kéo mắt khỏi hero hoặc làm ảnh kém premium.',
      questions: [
        'Có vùng nào sáng quá, tối quá, hoặc bão hòa quá không?',
        'Cây / xe / người có chiếm sự chú ý quá mức không?',
        'Có chi tiết bị crop khó chịu ở mép ảnh không?',
        'Nếu xóa 1 chi tiết, ảnh có mạnh hơn không?',
      ],
    },
  ],
  camera: [
    {
      id: 'framing', label: 'Framing', abbr: 'Fra', title: 'Framing Lens',
      purpose: 'Kiểm tra crop (cắt khung) và framing (cách dựng khung hình) có hỗ trợ hero và visual flow (dòng mắt) không.',
      questions: [
        'Hero có nằm đúng vị trí trong frame không?',
        'Crop có cắt phải vùng quan trọng không?',
        'Có khoảng trống nào không cần thiết không?',
        'Aspect ratio (tỉ lệ khung hình) có đúng deliverable (định dạng giao) không?',
      ],
    },
    {
      id: 'perspective', label: 'Perspective', abbr: 'Per', title: 'Perspective Lens',
      purpose: 'Kiểm tra perspective (cảm giác phối cảnh) có làm công trình đẹp, vững và đúng cảm giác kiến trúc không.',
      questions: [
        'Vertical lines (đường thẳng đứng) có bị nghiêng ngoài ý đồ không?',
        'Camera có bị fisheye (mắt cá quá rộng) hoặc quá wide không?',
        'Focal length (độ rộng / hẹp ống kính) có làm công trình bị méo hoặc kéo dài không?',
        'Góc nhìn có giúp công trình premium hơn không?',
      ],
    },
    {
      id: 'vertical', label: 'Vertical', abbr: 'Ver', title: 'Vertical Lens',
      purpose: 'Kiểm tra các đường vertical (thẳng đứng) kiến trúc có thẳng và kiểm soát.',
      questions: [
        'Các đường đứng (cột, mullion, parapet) có thẳng không?',
        'Có bị keystoning (đỉnh hội tụ) không?',
        'Two-point perspective có đúng không?',
        'Tilt-shift (chỉnh perspective trong camera) có cần áp dụng không?',
      ],
    },
    {
      id: 'focalLength', label: 'Focal Length', abbr: 'Foc', title: 'Focal Length Lens',
      purpose: 'Kiểm tra focal length (độ rộng / hẹp của ống kính) có cho cảm giác tự nhiên, không méo.',
      questions: [
        'Có cảm giác fisheye không (14–18mm)?',
        'Compression (nén phối cảnh) có đúng cho thể loại ảnh không?',
        '28–50mm equivalent có phù hợp hơn không?',
        'Có element nào bị méo ở rìa frame không?',
      ],
    },
    {
      id: 'depth', label: 'Depth', abbr: 'Dep', title: 'Depth Lens',
      purpose: 'Kiểm tra chiều sâu trong khung hình.',
      questions: [
        'Foreground / midground / background có tách lớp rõ không?',
        'Có atmospheric perspective (mờ dần theo chiều xa) không?',
        'Chiều sâu có dẫn mắt vào hero không?',
        'Ảnh có bị flat (phẳng) không?',
      ],
    },
    {
      id: 'contrastBalance', label: 'Contrast & Balance', abbr: 'CB', title: 'Contrast & Balance Lens',
      purpose: 'Tương phản & cân bằng giữa kiến trúc và các yếu tố phụ. Cây, sky, mây, người, xe, props (đồ trang trí), foreground (lớp trước ảnh) và atmosphere phải tạo đối trọng phù hợp với kiến trúc — không chỉ để lấp chỗ trống. Đừng hỏi asset này có đẹp riêng lẻ không; hãy hỏi nó có làm công trình đúng tính cách hơn không. Yếu tố phụ tốt là yếu tố có vai trò: làm mềm khối cứng, tạo depth (chiều sâu), dẫn mắt, cho scale, tăng lifestyle hoặc làm hero (điểm chính cần khoe) nổi hơn.',
      questions: [
        'Kiến trúc chính đang có tính cách gì: mạnh, mềm, tối giản, classic, luxury, resort, urban hay commercial?',
        'Các yếu tố phụ đang cân bằng tính cách đó hay làm ảnh bị lệch mood (cảm xúc tổng thể)?',
        'Công trình nhiều đường thẳng / khối mạnh thì cây, mây, bóng đổ và foreground đã đủ mềm để cân bằng chưa?',
        'Nếu công trình nhiều chi tiết, các yếu tố phụ có đang được tiết chế để không tranh spotlight (sự chú ý chính) không?',
        'Cây, người, xe, sky hoặc props có đang hỗ trợ hero hay đang kéo mắt khỏi hero?',
        'Màu cây, màu trời, màu xe, outfit người và props có hòa vào palette (bảng màu tổng thể) không?',
        'Nếu bỏ một yếu tố phụ ra khỏi ảnh, ảnh sẽ yếu hơn hay sạch hơn?',
      ],
    },
    {
      id: 'safeFrame', label: 'Safe Frame', abbr: 'SF', title: 'Safe Frame Lens',
      purpose: 'Kiểm tra vùng safe frame và margin (lề an toàn quanh khung hình).',
      questions: [
        'Hero có nằm trong safe area không?',
        'Có element quan trọng bị clip ở mép không?',
        'Margin (lề) có đủ cho text overlay (chữ chèn) nếu cần không?',
        'Bốn góc có sạch không?',
      ],
    },
  ],
  material: [
    {
      id: 'material', label: 'Material', abbr: 'Mat', title: 'Material Lens',
      purpose: 'Kiểm tra material có believable (đáng tin) và đúng project không.',
      questions: [
        'Material có khớp reference / brief không?',
        'Roughness (độ nhám / bóng) và glossiness có đúng cảm giác thực tế không?',
        'IOR (chỉ số khúc xạ ánh sáng) và refraction có phù hợp không?',
        'Material có giữ premium level không?',
      ],
    },
    {
      id: 'textureScale', label: 'Texture Scale', abbr: 'TS', title: 'Texture Scale Lens',
      purpose: 'Kiểm tra texture (vân vật liệu) và UVW mapping (cách texture bám lên model) có đúng scale (tỉ lệ) thực tế không.',
      questions: [
        'Đá, gỗ, tường, mái, vải có đúng kích thước ngoài đời không?',
        'Texture có bị stretch (kéo giãn), repeat (lặp) hoặc sai UVW mapping không?',
        'Pattern có làm lộ cảm giác CG không?',
        'Material có giữ được level premium không?',
      ],
    },
    {
      id: 'lightingDirection', label: 'Hướng sáng', abbr: 'LD', title: 'Lighting Direction Lens',
      purpose: 'Kiểm tra hướng ánh sáng có hỗ trợ mood và làm rõ kiến trúc.',
      questions: [
        'Hướng sun / key light (đèn chính) có nhất quán toàn scene không?',
        'Hướng shadow (bóng đổ) có phù hợp với time of day (giờ trong ngày) không?',
        'Ánh sáng có làm nổi facade và hero không?',
        'Fill / bounce light (ánh nảy) có quá flat không?',
      ],
    },
    {
      id: 'exposure', label: 'Exposure', abbr: 'Exp', title: 'Exposure Lens',
      purpose: 'Kiểm tra exposure (độ sáng tổng thể) không clip highlight và không crush shadow.',
      questions: [
        'Highlight (vùng sáng mạnh) ở kính, sky, mái sáng có bị blown (cháy trắng) không?',
        'Shadow (vùng tối) detail có bị crushed (đen kịt mất chi tiết) không?',
        'Midtone (vùng trung gian) có đủ contrast không?',
        'Exposure có giúp hero nổi không?',
      ],
    },
    {
      id: 'reflection', label: 'Reflection', abbr: 'Ref', title: 'Reflection Lens',
      purpose: 'Kiểm tra reflection (phản chiếu) trên kính, kim loại, mặt nước.',
      questions: [
        'Kính có depth hay bị đen / phẳng?',
        'Reflection có khớp environment (môi trường xung quanh) không?',
        'Kim loại có roughness hợp lý không?',
        'Có ghost reflection (phản chiếu lạ) bất thường không?',
      ],
    },
    {
      id: 'colorTemperature', label: 'Nhiệt màu', abbr: 'CT', title: 'Color Temperature Lens',
      purpose: 'Kiểm tra cân bằng warm (ấm) / cool (lạnh) giữa các vùng.',
      questions: [
        'Sky, sunlight, interior light có cùng story warm / cool không?',
        'Có vùng nào bị ám màu (color cast) không?',
        'Greens / blues / browns có đúng tone project không?',
        'Có gây cảm giác lạnh / ấm không phù hợp brief không?',
      ],
    },
    {
      id: 'contrastBalance', label: 'Contrast & Balance', abbr: 'CB', title: 'Contrast & Balance Lens',
      purpose: 'Tương phản & cân bằng giữa kiến trúc và các yếu tố phụ. Cây, sky, mây, người, xe, props (đồ trang trí), foreground (lớp trước ảnh) và atmosphere phải tạo đối trọng phù hợp với kiến trúc — không chỉ để lấp chỗ trống. Đừng hỏi asset này có đẹp riêng lẻ không; hãy hỏi nó có làm công trình đúng tính cách hơn không. Yếu tố phụ tốt là yếu tố có vai trò: làm mềm khối cứng, tạo depth (chiều sâu), dẫn mắt, cho scale, tăng lifestyle hoặc làm hero (điểm chính cần khoe) nổi hơn.',
      questions: [
        'Kiến trúc chính đang có tính cách gì: mạnh, mềm, tối giản, classic, luxury, resort, urban hay commercial?',
        'Các yếu tố phụ đang cân bằng tính cách đó hay làm ảnh bị lệch mood (cảm xúc tổng thể)?',
        'Công trình nhiều đường thẳng / khối mạnh thì cây, mây, bóng đổ và foreground đã đủ mềm để cân bằng chưa?',
        'Nếu công trình nhiều chi tiết, các yếu tố phụ có đang được tiết chế để không tranh spotlight (sự chú ý chính) không?',
        'Cây, người, xe, sky hoặc props có đang hỗ trợ hero hay đang kéo mắt khỏi hero?',
        'Màu cây, màu trời, màu xe, outfit người và props có hòa vào palette (bảng màu tổng thể) không?',
        'Nếu bỏ một yếu tố phụ ra khỏi ảnh, ảnh sẽ yếu hơn hay sạch hơn?',
      ],
    },
  ],
  render: [
    {
      id: 'noise', label: 'Noise', abbr: 'Noi', title: 'Noise Lens',
      purpose: 'Soi noise, fireflies và vùng render chưa sạch.',
      questions: [
        'Vùng shadow, kính, reflection, nội thất có noise không?',
        'Denoise có làm mất detail không?',
        'Có fireflies ở highlight hoặc glossy reflection không?',
        'Ảnh xem ở 100% zoom có đủ sạch không?',
      ],
    },
    {
      id: 'edge', label: 'Edge', abbr: 'Edg', title: 'Edge Quality Lens',
      purpose: 'Kiểm tra cạnh và chi tiết nhỏ có sạch không.',
      questions: [
        'Có jaggy / aliasing trên cạnh diagonal không?',
        'Railing, mullion, vegetation có bị stair-stepping không?',
        'AA samples có đủ không?',
        'Cạnh contrast cao có sharp đúng mức không?',
      ],
    },
    {
      id: 'geometry', label: 'Geometry', abbr: 'Geo', title: 'Geometry Lens',
      purpose: 'Tìm geometry thiếu, sai hoặc floating.',
      questions: [
        'Có object nào bay khỏi sàn không?',
        'Có gap giữa panel facade hoặc tường không?',
        'Có thấu tường (see-through) bất ngờ không?',
        'Có element bị thụt sâu vào geometry khác không?',
      ],
    },
    {
      id: 'contactShadow', label: 'Contact shadow', abbr: 'CS', title: 'Contact Shadow Lens',
      purpose: 'Kiểm tra contact shadow và AO dưới object.',
      questions: [
        'Object có đủ contact shadow để ground nó không?',
        'AO có đúng cường độ không (không quá đậm)?',
        'Furniture, người, xe có cảm giác chạm sàn không?',
        'Vùng góc tường / sàn có shadow đủ depth không?',
      ],
    },
    {
      id: 'glass', label: 'Glass', abbr: 'Gla', title: 'Glass Lens',
      purpose: 'Kiểm tra kính có depth, refraction, reflection đúng.',
      questions: [
        'Kính có thấy interior phía sau không, hay bị đen?',
        'Refraction depth có đúng không?',
        'Reflection trên kính có khớp environment không?',
        'Mullion có rõ và sharp không?',
      ],
    },
    {
      id: 'artifacts', label: 'Artifacts', abbr: 'Art', title: 'Artifacts Lens',
      purpose: 'Tìm splotch, banding, light leak, pass merge sai.',
      questions: [
        'Sky có bị banding không?',
        'GI có splotchy không?',
        'Có light leak ở seam material không?',
        'Render passes có bị mis-merged không?',
      ],
    },
  ],
  post: [
    {
      id: 'colorGrading', label: 'Color grading', abbr: 'CG', title: 'Color Grading Lens',
      purpose: 'Kiểm tra color grading có thống nhất mood và không phá material không.',
      questions: [
        'Grade có quá nóng, quá lạnh hoặc lệch brief không?',
        'Greens có quá bão hòa không?',
        'Black có bị crushed không?',
        'Sky, building, landscape và interior light có cùng một mood không?',
      ],
    },
    {
      id: 'toneWhiteBalance', label: 'Tone & White Balance', abbr: 'TWB', title: 'Tone & White Balance Lens',
      purpose: 'Cân bằng trắng, sáng tối và độ "căng" của ảnh sau post-production. Ảnh cần có lực mà không bị cháy, bệt hoặc chỉnh quá tay. Ảnh "căng" không phải là kéo contrast (độ tương phản sáng tối) thật mạnh — mà là khi vùng sáng sạch, vùng tối có chiều sâu, midtone (vùng sáng trung bình) rõ, và công trình chính nổi lên mà vẫn giữ được detail.',
      questions: [
        'Vùng trắng như tường, trần, đá sáng hoặc giấy trắng có bị ám xanh, ám vàng, ám magenta không?',
        'Highlight (vùng sáng mạnh) có sạch và còn detail không, hay bị cháy trắng?',
        'Shadow (vùng tối / bóng đổ) có đủ sâu để ảnh có lực không, hay bị bệt và mất chi tiết?',
        'Midtone (vùng sáng trung bình) của công trình chính có đủ rõ không, hay bị xám / flat?',
        'Contrast có giúp ảnh nổi hơn không, hay làm ảnh bị gắt?',
        'Sky, landscape, công trình và interior light có cùng một white balance (cân bằng trắng) không?',
        'Khi thu nhỏ ảnh, công trình chính có bật ra rõ không?',
        'Khi zoom 100%, các vùng chuyển sáng tối có bị banding, halo (viền sáng giả) hoặc quá sharpen (làm nét) không?',
      ],
    },
    {
      id: 'contrastBalance', label: 'Contrast & Balance', abbr: 'CB', title: 'Contrast & Balance Lens',
      purpose: 'Tương phản & cân bằng giữa kiến trúc và các yếu tố phụ. Cây, sky, mây, người, xe, props (đồ trang trí), foreground (lớp trước ảnh) và atmosphere phải tạo đối trọng phù hợp với kiến trúc — không chỉ để lấp chỗ trống. Đừng hỏi asset này có đẹp riêng lẻ không; hãy hỏi nó có làm công trình đúng tính cách hơn không. Yếu tố phụ tốt là yếu tố có vai trò: làm mềm khối cứng, tạo depth (chiều sâu), dẫn mắt, cho scale, tăng lifestyle hoặc làm hero (điểm chính cần khoe) nổi hơn.',
      questions: [
        'Kiến trúc chính đang có tính cách gì: mạnh, mềm, tối giản, classic, luxury, resort, urban hay commercial?',
        'Các yếu tố phụ đang cân bằng tính cách đó hay làm ảnh bị lệch mood (cảm xúc tổng thể)?',
        'Công trình nhiều đường thẳng / khối mạnh thì cây, mây, bóng đổ và foreground đã đủ mềm để cân bằng chưa?',
        'Nếu công trình nhiều chi tiết, các yếu tố phụ có đang được tiết chế để không tranh spotlight (sự chú ý chính) không?',
        'Cây, người, xe, sky hoặc props có đang hỗ trợ hero hay đang kéo mắt khỏi hero?',
        'Màu cây, màu trời, màu xe, outfit người và props có hòa vào palette (bảng màu tổng thể) không?',
        'Nếu bỏ một yếu tố phụ ra khỏi ảnh, ảnh sẽ yếu hơn hay sạch hơn?',
      ],
    },
    {
      id: 'overProcessing', label: 'Over-processing', abbr: 'OP', title: 'Over-processing Lens',
      purpose: 'Tìm dấu hiệu over-sharpen, over-contrast, over-clarity.',
      questions: [
        'Có halo quanh cạnh contrast cao không?',
        'Foliage có bị sạn không?',
        'Texture có bị crunchy không?',
        'Ảnh có cảm giác post quá tay không?',
      ],
    },
    {
      id: 'entourage', label: 'Entourage', abbr: 'Ent', title: 'Entourage Integration Lens',
      purpose: 'Kiểm tra entourage có hòa với scene về light, scale, mood.',
      questions: [
        'Người, xe, cây có lit cùng hướng sun không?',
        'Scale của entourage có đúng không?',
        'Có contact shadow dưới entourage không?',
        'Color temperature của entourage có khớp scene không?',
      ],
    },
    {
      id: 'crop', label: 'Crop / mép ảnh', abbr: 'Cro', title: 'Crop & Border Lens',
      purpose: 'Kiểm tra crop và 4 mép có sạch.',
      questions: [
        'Có element bị crop khó chịu ở mép không?',
        'Aspect ratio có đúng deliverable không?',
        'Sky có quá cao hoặc quá thấp không?',
        '4 góc có sạch không?',
      ],
    },
    {
      id: 'clientComments', label: 'Client Comments', abbr: 'CC', title: 'Client Comments Lens',
      purpose: 'Verify mọi comment client đã được xử lý.',
      questions: [
        'Bạn đã mở file markup mới nhất chưa?',
        'Mỗi comment có được xử lý hoặc đánh dấu chưa?',
        'Có comment nào áp dụng nhầm view không?',
        'Có comment nào còn đang hiểu sai không?',
      ],
    },
    {
      id: 'export', label: 'Export', abbr: 'Exp', title: 'Export Quality Lens',
      purpose: 'Kiểm tra filename, format, profile, resolution trước khi gửi.',
      questions: [
        'Filename có đúng convention không?',
        'Format và color profile có đúng spec không?',
        'Resolution có đúng deliverable không?',
        'Embedded preview có chất lượng đúng không?',
      ],
    },
  ],
}

// Focus Coach — context-aware self-check question that whispers what to look at right now.
// Lookup priority: expanded checklist item → active lens → phase default.
const PHASE_COACH = {
  storytelling: {
    question: 'Trước khi sửa chi tiết, ảnh này đang bán điều gì?',
    hint: 'Nếu không trả lời được bằng một câu ngắn, direction của ảnh có thể đang bị lan man.',
  },
  camera: {
    question: 'Mắt người xem có được dẫn vào công trình chính một cách tự nhiên không?',
    hint: 'Nhìn flow từ foreground, đường nét kiến trúc, ánh sáng và khoảng trống.',
  },
  material: {
    question: 'Material và ánh sáng có làm công trình thật hơn và đúng mood hơn không?',
    hint: 'So sánh cảm giác bề mặt, roughness, shadow và white balance.',
  },
  render: {
    question: 'Nếu zoom 100%, ảnh còn sạch và đủ chi tiết không?',
    hint: 'Soi noise, edge, contact shadow, glass và các vùng tối.',
  },
  post: {
    question: 'Post-production đang làm ảnh sang hơn hay đang làm ảnh bị gắt / giả?',
    hint: 'Kiểm tra color grading, contrast, saturation, sharpen và crop.',
  },
}

// Keys are `${phaseId}:${lensId}`. Hint is optional.
const LENS_COACH = {
  // Storytelling
  'storytelling:story': { question: 'Ảnh này có một câu chuyện chính rõ ràng không, hay đang cố nói quá nhiều thứ?' },
  'storytelling:hero': {
    question: 'Hero có đủ mạnh để người xem nhớ ngay sau 3 giây không?',
    hint: 'Nheo mắt hoặc thu nhỏ ảnh để kiểm tra thứ gì nổi lên đầu tiên.',
  },
  'storytelling:hierarchy': { question: 'Đâu là chính, đâu là phụ, đâu là noise?' },
  'storytelling:contrastBalance': { question: 'Yếu tố phụ đang tạo đối trọng tốt cho kiến trúc hay đang tranh spotlight?' },
  'storytelling:mood': { question: 'Tất cả yếu tố trong ảnh có đang cùng phục vụ một mood không?' },
  'storytelling:distraction': { question: 'Nếu phải xóa một chi tiết gây nhiễu, bạn sẽ xóa gì trước?' },

  // Camera & Composition
  'camera:framing': { question: 'Khung hình này đang khoe đúng phần đẹp nhất của công trình chưa?' },
  'camera:perspective': {
    question: 'Góc máy này đang làm công trình sang hơn, hay đang làm nó méo / yếu đi?',
    hint: 'Kiểm tra vertical, focal length và cảm giác vững của khối kiến trúc.',
  },
  'camera:vertical': { question: 'Các đường đứng có được kiểm soát, hay đang làm công trình bị đổ / méo?' },
  'camera:focalLength': { question: 'Focal length đang giúp ảnh tự nhiên hay làm hình bị quá wide / fisheye?' },
  'camera:depth': { question: 'Foreground, midground, background có tạo depth rõ không?' },
  'camera:contrastBalance': { question: 'Cây, mây, foreground có làm mềm và cân bằng khối kiến trúc không?' },
  'camera:safeFrame': { question: 'Có chi tiết quan trọng nào bị sát mép hoặc bị crop khó chịu không?' },

  // Material & Lighting
  'material:material': { question: 'Material chính có believable không, hay vẫn còn cảm giác CG?' },
  'material:textureScale': { question: 'Texture có đúng scale thực tế khi so với người, cửa, xe hoặc furniture không?' },
  'material:lightingDirection': { question: 'Hướng sáng có làm nổi hero hay đang làm vùng chính bị chìm?' },
  'material:exposure': { question: 'Ảnh có đủ sáng để đọc rõ công trình mà không bị cháy highlight không?' },
  'material:reflection': { question: 'Kính, nước, kim loại có phản xạ đúng môi trường không?' },
  'material:colorTemperature': { question: 'Nhiệt màu của sky, đèn, interior và landscape có hòa nhau không?' },
  'material:contrastBalance': {
    question: 'Cây, sky, người, xe có đang làm công trình đúng tính cách hơn không?',
    hint: 'Yếu tố phụ tốt phải làm hero mạnh hơn, không chỉ lấp chỗ trống.',
  },

  // Render Quality
  'render:noise': { question: 'Vùng tối, kính và reflection có noise / fireflies không?' },
  'render:edge': { question: 'Các cạnh mảnh như lan can, khung kính, mái có sạch không?' },
  'render:geometry': { question: 'Có vật thể nào bị lơ lửng, xuyên nhau, thiếu hoặc sai vị trí không?' },
  'render:contactShadow': { question: 'Đồ vật có chạm đất và có trọng lượng không?' },
  'render:glass': { question: 'Kính có depth hay đang bị đen, phẳng hoặc quá gương?' },
  'render:artifacts': { question: 'Có lỗi render nào nhìn thấy ngay khi zoom 100% không?' },

  // Post Production
  'post:colorGrading': { question: 'Màu tổng thể có nâng mood hay làm lệch cảm giác material?' },
  'post:toneWhiteBalance': {
    question: 'Ảnh đang "căng" vì tone sạch, hay chỉ vì contrast bị kéo quá mạnh?',
    hint: 'Kiểm tra vùng trắng, highlight, shadow và midtone của công trình.',
  },
  'post:contrastBalance': { question: 'Post có giữ được sự cân bằng giữa kiến trúc, sky, landscape và entourage không?' },
  'post:overProcessing': { question: 'Ảnh có dấu hiệu chỉnh quá tay như halo, sharpen mạnh, saturation gắt không?' },
  'post:entourage': { question: 'Người, cây, xe, props có hòa vào ảnh hay nhìn như dán thêm?' },
  'post:crop': { question: 'Mép ảnh có chi tiết nào bị cắt khó chịu hoặc gây mất tập trung không?' },
  'post:clientComments': { question: 'Những comment quan trọng nhất đã được xử lý thật sự chưa?' },
  'post:export': { question: 'File cuối có đúng format, size, color profile và đủ chất lượng chưa?' },
}

// Keys match the storage key shape used by the checklist (storytelling items
// are namespaced by projectType). Only important items get coach questions —
// everything else falls back to lens or phase question.
const ITEM_COACH = {
  // Storytelling general (per-projectType key)
  'storytelling:general:1': {
    question: 'Hero có đủ mạnh để người xem nhớ ngay sau 3 giây không?',
    hint: 'Nheo mắt hoặc thu nhỏ ảnh để kiểm tra thứ gì nổi lên đầu tiên.',
  },
  'storytelling:general:2': {
    question: 'Bạn có chỉ ra rõ 3 lớp: chính, phụ, nền không?',
    hint: 'Nếu mọi vùng đều đòi attention như nhau, ảnh đang thiếu hierarchy.',
  },
  'storytelling:general:4': {
    question: 'Chi tiết này đang giúp ảnh mạnh hơn, hay chỉ làm bạn cảm thấy ảnh "đầy" hơn?',
    hint: 'Nếu bỏ chi tiết đó đi mà ảnh sạch và rõ hơn, nó có thể là noise.',
  },
  'storytelling:general:5': {
    question: 'Tất cả yếu tố trong ảnh có đang cùng phục vụ một mood không?',
    hint: 'Camera, lighting, material, entourage và color grading phải cùng nói một ngôn ngữ.',
  },

  // Camera
  'camera:1': {
    question: 'Khung hình này đang khoe đúng phần đẹp nhất của công trình chưa?',
    hint: 'Hình dung nghiêng ảnh — có quadrant nào quá trống hoặc quá nặng không?',
  },
  'camera:2': {
    question: 'Các đường đứng có được kiểm soát, hay đang làm công trình bị đổ / méo?',
    hint: 'Đặt thước thẳng đứng cạnh màn hình — các cột công trình có song song không?',
  },
  'camera:3': {
    question: 'Focal length đang giúp ảnh tự nhiên hay làm hình bị quá wide / fisheye?',
    hint: '28–50mm equivalent thường gần với cách kiến trúc sư chụp ảnh thật.',
  },

  // Material
  'material:1': {
    question: 'Nếu đặt một người đứng cạnh bề mặt này, texture còn đúng kích thước không?',
    hint: 'So scale của vân gỗ, đá, gạch, vải với cửa, tay vịn, người hoặc xe.',
  },
  'material:3': {
    question: 'Hướng sáng có làm nổi hero hay đang làm vùng chính bị chìm?',
    hint: 'Trace một shadow ngược về source — source đó có nhất quán với mọi shadow khác không?',
  },
  'material:5': {
    question: 'Kính, nước, kim loại có phản xạ đúng môi trường không?',
    hint: 'Reflection phải khớp object xung quanh về vị trí và độ mềm.',
  },

  // Render
  'render:0': {
    question: 'Vùng tối, kính và reflection có noise / fireflies không?',
    hint: 'Xem ảnh ở 100% zoom và quét từ các góc về focal point.',
  },
  'render:5': {
    question: 'Có lỗi render nào nhìn thấy ngay khi zoom 100% không?',
    hint: 'Soi sky banding, GI splotchy, light leak ở seam material.',
  },

  // Post
  'post:0': {
    question: 'Màu tổng thể có nâng mood hay làm lệch cảm giác material?',
    hint: 'Squint hoặc thu nhỏ ảnh — phải đọc thành một mood thống nhất.',
  },
  'post:1': {
    question: 'Ảnh có đang bị đẹp kiểu "gắt" thay vì sang không?',
    hint: 'Giảm clarity, sharpen, saturation hoặc local contrast nếu thấy halo và viền giả.',
  },
  'post:2': {
    question: 'Người, cây, xe có hòa vào scene hay nhìn như dán thêm?',
    hint: 'Check hướng sun, shadow contact, color temperature và scale.',
  },
  'post:3': {
    question: 'Mép ảnh có chi tiết nào bị cắt khó chịu hoặc gây mất tập trung không?',
    hint: 'Soi 4 cạnh và 4 góc; aspect ratio có đúng deliverable không?',
  },
  'post:6': {
    question: 'Khi thu nhỏ ảnh, vùng trắng có còn cảm giác sạch và công trình có bật ra không?',
    hint: 'Check ám màu trên trắng, highlight detail, shadow depth, midtone clarity.',
  },
}

// Mark types — visual styles centralized so both helper toolbar and overlay use same colors.
const MARK_TYPES = [
  {
    id: 'hero', label: 'Vùng hero',
    borderCls: 'border-cyan-400 dark:border-cyan-300',
    fillCls: 'bg-cyan-400/15',
    dotCls: 'bg-cyan-500',
    activeBgCls: 'bg-cyan-600',
  },
  {
    id: 'support', label: 'Vùng hỗ trợ',
    borderCls: 'border-emerald-400 dark:border-emerald-300',
    fillCls: 'bg-emerald-400/15',
    dotCls: 'bg-emerald-500',
    activeBgCls: 'bg-emerald-600',
  },
  {
    id: 'distraction', label: 'Gây nhiễu',
    borderCls: 'border-amber-400 dark:border-amber-300',
    fillCls: 'bg-amber-400/15',
    dotCls: 'bg-amber-500',
    activeBgCls: 'bg-amber-600',
  },
  {
    id: 'fix', label: 'Cần sửa',
    borderCls: 'border-rose-500 dark:border-rose-400',
    fillCls: 'bg-rose-500/15',
    dotCls: 'bg-rose-500',
    activeBgCls: 'bg-rose-600',
  },
  {
    id: 'pin', label: 'Ghi chú',
    borderCls: '',
    fillCls: '',
    dotCls: 'bg-purple-600',
    activeBgCls: 'bg-purple-600',
  },
]

const STORAGE_KEY = 'jcviz-self-qc-v3'
const THEME_KEY = 'jcviz-self-qc-theme-v1'

const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'needsfix', label: 'Cần sửa' },
  { id: 'unchecked', label: 'Chưa kiểm' },
  { id: 'passed', label: 'Đạt' },
]

// Compact phase labels for the sidebar tab strip. Full official names live in PHASES[].name.
const PHASE_SHORT_NAMES = {
  storytelling: 'Storytelling',
  camera: 'Camera',
  material: 'Material',
  render: 'Render',
  post: 'Post',
}

const todayISO = () => new Date().toISOString().slice(0, 10)

const getActiveItems = (phaseId, projectType) => {
  if (phaseId === 'storytelling') {
    return STORYTELLING_ITEMS_BY_TYPE[projectType] || STORYTELLING_ITEMS_BY_TYPE.general
  }
  const phase = PHASES.find((p) => p.id === phaseId)
  return phase?.items || []
}

const getItemKey = (phaseId, projectType, idx) => {
  if (phaseId === 'storytelling') return `storytelling:${projectType}:${idx}`
  return `${phaseId}:${idx}`
}

const defaultState = () => {
  const items = {}
  Object.entries(STORYTELLING_ITEMS_BY_TYPE).forEach(([typeId, typeItems]) => {
    typeItems.forEach((_, idx) => {
      items[`storytelling:${typeId}:${idx}`] = { status: 'unchecked', note: '' }
    })
  })
  PHASES.filter((p) => p.id !== 'storytelling').forEach((p) => {
    p.items.forEach((_, idx) => {
      items[`${p.id}:${idx}`] = { status: 'unchecked', note: '' }
    })
  })
  return {
    project: '',
    view: '',
    artist: '',
    date: todayISO(),
    activePhase: PHASES[0].id,
    projectType: 'general',
    items,
    readyForReview: false,
    marks: [],
    lensScores: {},
  }
}

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw)
    const def = defaultState()
    return {
      ...def,
      ...parsed,
      items: { ...def.items, ...(parsed.items || {}) },
      marks: Array.isArray(parsed.marks) ? parsed.marks : [],
      lensScores: migrateLensScores(parsed.lensScores),
    }
  } catch {
    return defaultState()
  }
}

// Old shape was a flat { lensId: number } map across all phases.
// New shape is { phaseId: { lensId: number } }. If we detect the old shape
// (any value is a primitive number), discard it — the IDs no longer match.
const migrateLensScores = (raw) => {
  if (!raw || typeof raw !== 'object') return {}
  const looksOldFlat = Object.values(raw).some((v) => typeof v === 'number')
  if (looksOldFlat) return {}
  return raw
}

const loadTheme = () => {
  try {
    const t = localStorage.getItem(THEME_KEY)
    if (t === 'light' || t === 'dark') return t
  } catch { /* ignore */ }
  return 'dark'
}

const inputCls =
  'w-full px-2.5 py-1 text-xs rounded border border-slate-200 bg-white placeholder:text-slate-400 ' +
  'dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ' +
  'focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/30'

export default function App() {
  const [state, setState] = useState(loadState)
  const [filter, setFilter] = useState('all')
  const [expandedItemId, setExpandedItemId] = useState(null)
  const [theme, setTheme] = useState(loadTheme)
  // local UI state (not persisted)
  // activeLensByPhase remembers each phase's selected lens; defaults to the first
  // lens of each phase on first mount, then user can change or deselect per phase.
  const [activeLensByPhase, setActiveLensByPhase] = useState(() => {
    const init = {}
    for (const phaseId in LENSES_BY_PHASE) {
      const lenses = LENSES_BY_PHASE[phaseId]
      if (lenses && lenses.length > 0) init[phaseId] = lenses[0].id
    }
    return init
  })
  const [markMode, setMarkMode] = useState('select')
  const [selectedMarkId, setSelectedMarkId] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  // AI Review mode — state RIÊNG, tách khỏi Self-QC (không persist, không trộn STORAGE_KEY).
  const [appMode, setAppMode] = useState('selfqc') // 'selfqc' | 'aireview'
  const [aiMarks, setAiMarks] = useState([])
  const [selectedAiMarkId, setSelectedAiMarkId] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme) } catch { /* ignore */ }
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    setExpandedItemId(null)
  }, [state.activePhase, state.projectType])

  const update = (patch) => setState((s) => ({ ...s, ...patch }))
  const updateItem = (key, patch) =>
    setState((s) => {
      const next = {
        ...s,
        items: { ...s.items, [key]: { ...s.items[key], ...patch } },
      }
      if ('status' in patch) next.readyForReview = false
      return next
    })

  const addMark = (markData) =>
    setState((s) => ({
      ...s,
      marks: [
        ...s.marks,
        {
          id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          lens: activeLensByPhase[s.activePhase] || null,
          phase: s.activePhase,
          createdAt: Date.now(),
          ...markData,
        },
      ],
    }))

  const deleteMark = (id) => {
    setState((s) => ({ ...s, marks: s.marks.filter((m) => m.id !== id) }))
    setSelectedMarkId((cur) => (cur === id ? null : cur))
  }

  const deleteSelectedMark = () => {
    if (selectedMarkId) deleteMark(selectedMarkId)
  }

  const clearAllMarks = () => {
    if (state.marks.length === 0) return
    if (confirm('Xóa tất cả mark trên ảnh?')) {
      setState((s) => ({ ...s, marks: [] }))
      setSelectedMarkId(null)
    }
  }

  const updateMarkNote = (id, note) =>
    setState((s) => ({
      ...s,
      marks: s.marks.map((m) => (m.id === id ? { ...m, note } : m)),
    }))

  // AI Review marks — riêng, ephemeral (không đụng state.marks của Self-QC).
  const addAiMark = (markData) =>
    setAiMarks((m) => [
      ...m,
      { id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: Date.now(), ...markData },
    ])
  const clearAiMarks = () => { setAiMarks([]); setSelectedAiMarkId(null) }
  const deleteSelectedAiMark = () => {
    if (!selectedAiMarkId) return
    setAiMarks((m) => m.filter((x) => x.id !== selectedAiMarkId))
    setSelectedAiMarkId(null)
  }

  const setLensScore = (phaseId, lensId, score) =>
    setState((s) => {
      const phaseScores = { ...(s.lensScores[phaseId] || {}) }
      if (score == null) delete phaseScores[lensId]
      else phaseScores[lensId] = score
      return {
        ...s,
        lensScores: { ...s.lensScores, [phaseId]: phaseScores },
      }
    })

  // Counts
  const visibleKeys = []
  PHASES.forEach((phase) => {
    const items = getActiveItems(phase.id, state.projectType)
    items.forEach((_, idx) => {
      visibleKeys.push(getItemKey(phase.id, state.projectType, idx))
    })
  })
  const totalItems = visibleKeys.length
  const passedCount = visibleKeys.filter((k) => state.items[k]?.status === 'passed').length
  const needsFixCount = visibleKeys.filter((k) => state.items[k]?.status === 'needsfix').length
  const uncheckedCount = totalItems - passedCount - needsFixCount
  const allPassed = totalItems > 0 && passedCount === totalItems
  const progress = totalItems ? Math.round((passedCount / totalItems) * 100) : 0

  const status = needsFixCount > 0
    ? { label: 'Cần sửa', color: 'rose' }
    : allPassed
      ? { label: 'Sẵn sàng review', color: 'emerald' }
      : { label: 'Chưa sẵn sàng', color: 'slate' }

  const activePhase = PHASES.find((p) => p.id === state.activePhase) || PHASES[0]
  const activeItemsList = getActiveItems(activePhase.id, state.projectType)
  const phaseItemsForActive = activeItemsList.map((_, idx) =>
    state.items[getItemKey(activePhase.id, state.projectType, idx)]
  )
  const phasePassedCount = phaseItemsForActive.filter((it) => it?.status === 'passed').length

  const filterCounts = {
    all: activeItemsList.length,
    needsfix: phaseItemsForActive.filter((it) => it?.status === 'needsfix').length,
    unchecked: phaseItemsForActive.filter((it) => it?.status === 'unchecked').length,
    passed: phaseItemsForActive.filter((it) => it?.status === 'passed').length,
  }

  const filteredItemEntries = activeItemsList
    .map((item, idx) => {
      const key = getItemKey(activePhase.id, state.projectType, idx)
      return { item, idx, key, itemState: state.items[key] }
    })
    .filter(({ itemState }) => (filter === 'all' ? true : itemState?.status === filter))

  const remainingCount = totalItems - passedCount

  // Lens scores — overall avg (chrome bar) + current phase avg (sidebar footer)
  const allLensScoreValues = []
  for (const phaseId in state.lensScores) {
    const phaseScores = state.lensScores[phaseId]
    if (phaseScores) {
      for (const lensId in phaseScores) {
        const v = phaseScores[lensId]
        if (typeof v === 'number') allLensScoreValues.push(v)
      }
    }
  }
  const overallAvgLensScore = allLensScoreValues.length === 0
    ? null
    : allLensScoreValues.reduce((a, b) => a + b, 0) / allLensScoreValues.length

  // Per-phase active lens + lens objects + scores for the current phase
  const phaseLenses = LENSES_BY_PHASE[activePhase.id] || []
  const activeLens = activeLensByPhase[activePhase.id] || null
  const setActiveLens = (lensId) =>
    setActiveLensByPhase((prev) => ({ ...prev, [activePhase.id]: lensId }))
  const activeLensData = activeLens ? phaseLenses.find((l) => l.id === activeLens) : null
  const phaseLensScores = state.lensScores[activePhase.id] || {}
  const activeLensScore = activeLens ? phaseLensScores[activeLens] ?? null : null
  const phaseScoredLenses = phaseLenses.filter((l) => typeof phaseLensScores[l.id] === 'number')
  const phaseAvgLensScore = phaseScoredLenses.length === 0
    ? null
    : phaseScoredLenses.reduce((sum, l) => sum + phaseLensScores[l.id], 0) / phaseScoredLenses.length

  // Mark counts by type
  const markCounts = MARK_TYPES.reduce((acc, t) => {
    acc[t.id] = state.marks.filter((m) => m.type === t.id).length
    return acc
  }, {})

  const resetAll = () => {
    if (confirm('Reset toàn bộ checklist, ghi chú, marks và điểm lens? Cả thông tin project cũng sẽ bị xóa.')) {
      localStorage.removeItem(STORAGE_KEY)
      setState(defaultState())
      setSelectedMarkId(null)
      setMarkMode('select')
      // re-init each phase's lens to its first lens
      const init = {}
      for (const phaseId in LENSES_BY_PHASE) {
        const lenses = LENSES_BY_PHASE[phaseId]
        if (lenses && lenses.length > 0) init[phaseId] = lenses[0].id
      }
      setActiveLensByPhase(init)
    }
  }

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  // Pin numbering for sidebar mark list
  const pinsSorted = [...state.marks]
    .filter((m) => m.type === 'pin')
    .sort((a, b) => a.createdAt - b.createdAt)

  // Phase options cho AI Review mode (id + tên + title các item để model soi đúng trọng tâm).
  const aiPhaseOptions = PHASES.map((p) => ({
    id: p.id,
    name: p.name,
    checklist: getActiveItems(p.id, state.projectType).map((it) => it.title).filter(Boolean),
  }))

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-[#0B0F14] dark:text-slate-200">
      <header className="bg-white border-b border-slate-200 shrink-0 dark:bg-[#111827] dark:border-white/10">
        <div className="w-full px-4 py-2 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">Artist Self-QC</h1>
            <div className="flex items-center gap-0.5 rounded-md border border-slate-200 dark:border-white/15 p-0.5">
              <button
                type="button"
                onClick={() => setAppMode('selfqc')}
                className={`px-2 py-0.5 text-[11px] font-medium rounded transition ${appMode === 'selfqc' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'}`}
              >
                Self-QC
              </button>
              <button
                type="button"
                onClick={() => setAppMode('aireview')}
                className={`px-2 py-0.5 text-[11px] font-medium rounded transition flex items-center gap-1 ${appMode === 'aireview' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'}`}
              >
                AI Review<span className="text-[9px] opacity-70">beta</span>
              </button>
            </div>
          </div>
          <div className="flex-1 min-w-[260px] grid grid-cols-2 lg:grid-cols-4 gap-2">
            <input type="text" value={state.project} onChange={(e) => update({ project: e.target.value })} placeholder="Dự án" className={inputCls} />
            <input type="text" value={state.view} onChange={(e) => update({ view: e.target.value })} placeholder="View / Ảnh" className={inputCls} />
            <input type="text" value={state.artist} onChange={(e) => update({ artist: e.target.value })} placeholder="Artist" className={inputCls} />
            <input type="date" value={state.date} onChange={(e) => update({ date: e.target.value })} className={inputCls} />
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {appMode === 'selfqc' && (
              <>
                <StatusPill label={status.label} color={status.color} />
                <div className="hidden md:flex items-center gap-2">
                  <div className="w-24 lg:w-32 h-1.5 rounded-full bg-slate-100 overflow-hidden dark:bg-white/10">
                    <div
                      className={`h-full transition-all ${
                        needsFixCount > 0 ? 'bg-amber-500' : allPassed ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200 w-9 text-right">
                    {progress}%
                  </span>
                </div>
                <div className="hidden xl:flex items-center gap-2 text-[11px] tabular-nums">
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{passedCount}
                  </span>
                  <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>{needsFixCount}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>{uncheckedCount}
                  </span>
                </div>
                {overallAvgLensScore !== null && (
                  <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-500/15 dark:text-cyan-300 tabular-nums">
                    Senior {overallAvgLensScore.toFixed(1)}/5
                  </span>
                )}
              </>
            )}
            <button
              onClick={() => setShowHelp(true)}
              title="Hướng dẫn dùng app"
              aria-label="Hướng dẫn dùng app"
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-white/10 transition"
            >
              <HelpIcon />
              <span className="hidden xl:inline">Hướng dẫn</span>
            </button>
            <button
              onClick={toggleTheme}
              title="Đổi giao diện sáng/tối"
              aria-label="Đổi giao diện sáng/tối"
              className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-white/10 transition"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={resetAll}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition px-2"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-2 flex-1 flex flex-col min-h-0 gap-2">
        <div className={appMode === 'selfqc' ? 'flex-1 flex flex-col min-h-0' : 'hidden'}>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_clamp(380px,26vw,480px)] gap-3 h-full min-h-0 lg:min-h-[620px]">
          <div className="min-w-0 min-h-0">
            <ImageReviewHelper
              phase={activePhase}
              aiContext={{
                phaseId: activePhase.id,
                projectType: state.projectType,
                checklist: activeItemsList.map((it) => it.title).filter(Boolean),
              }}
              marking={{
                types: MARK_TYPES,
                mode: markMode,
                setMode: setMarkMode,
                marks: state.marks,
                selectedId: selectedMarkId,
                setSelectedId: setSelectedMarkId,
                onAdd: addMark,
                onDeleteSelected: deleteSelectedMark,
                onClearAll: clearAllMarks,
              }}
            />
          </div>

          <aside className="bg-white border border-slate-200 rounded-lg flex flex-col min-h-0 overflow-hidden dark:bg-[#111827] dark:border-white/10">
            {/* Phase tabs — sit at the top of the QC control panel so the active tab visually connects to the checklist below */}
            <div className="border-b border-slate-200 shrink-0 dark:border-white/10">
              <nav className="flex gap-0 -mb-px overflow-x-auto">
                {PHASES.map((phase) => {
                  const items = getActiveItems(phase.id, state.projectType)
                  const phItems = items.map((_, idx) => state.items[getItemKey(phase.id, state.projectType, idx)])
                  const phPassed = phItems.filter((it) => it?.status === 'passed').length
                  const phFix = phItems.filter((it) => it?.status === 'needsfix').length
                  const isActive = state.activePhase === phase.id
                  return (
                    <button
                      key={phase.id}
                      type="button"
                      onClick={() => update({ activePhase: phase.id })}
                      title={phase.name}
                      className={`px-2 py-2 text-[11px] font-semibold uppercase tracking-wide border-b-2 transition whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
                      }`}
                    >
                      {PHASE_SHORT_NAMES[phase.id] || phase.name}
                      <span className="ml-1.5 text-[10px] font-normal normal-case text-slate-400 dark:text-slate-500 tabular-nums">{phPassed}/{items.length}</span>
                      {phFix > 0 && (
                        <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-rose-500" title={`${phFix} mục cần sửa`}></span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>

            <header className="px-4 py-3 border-b border-slate-200 shrink-0 dark:border-white/10">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{activePhase.name}</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                  {phasePassedCount}/{activeItemsList.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{activePhase.intent}</p>
              {activePhase.id === 'storytelling' && (
                <>
                  <div className="mt-2.5 flex items-center gap-2">
                    <label htmlFor="project-type-select" className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                      Loại hình:
                    </label>
                    <select
                      id="project-type-select"
                      value={state.projectType}
                      onChange={(e) => update({ projectType: e.target.value })}
                      className="flex-1 px-2 py-1 text-xs rounded border border-slate-200 bg-white text-slate-800 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/30"
                    >
                      {PROJECT_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-slate-500 dark:text-slate-400 italic">
                    Trước khi sửa chi tiết, hãy xác định ảnh này đang bán điều gì. Nếu hero chưa rõ, mọi phần kỹ thuật phía sau đều dễ bị lan man.
                  </p>
                </>
              )}
            </header>

            {activePhase.id === 'storytelling' && <QuickTestsBlock />}

            <FocusCoach
              phaseId={activePhase.id}
              lensId={activeLens}
              expandedItemKey={expandedItemId}
            />

            {/* Phase-specific lens selector — under the phase header */}
            {phaseLenses.length > 0 && (
              <div className="px-3 py-1.5 border-b border-slate-200 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-0.5">
                    Lens
                  </span>
                  {phaseLenses.map((l) => {
                    const active = activeLens === l.id
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setActiveLens(active ? null : l.id)}
                        title={l.purpose}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded transition ${
                          active
                            ? 'bg-cyan-600 text-white dark:bg-cyan-500'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
                        }`}
                      >
                        {l.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {activeLensData && (
              <LensGuidancePanel
                lens={activeLensData}
                score={activeLensScore}
                onScore={(n) => setLensScore(activePhase.id, activeLensData.id, n)}
              />
            )}

            {state.marks.length > 0 && (
              <MarksSummary
                marks={state.marks}
                pinsSorted={pinsSorted}
                markCounts={markCounts}
                markTypes={MARK_TYPES}
                selectedId={selectedMarkId}
                onSelect={setSelectedMarkId}
                onUpdateNote={updateMarkNote}
                onDelete={deleteMark}
                onClearAll={clearAllMarks}
              />
            )}

            <div className="px-3 py-2 border-b border-slate-200 bg-slate-50/50 shrink-0 dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                {FILTERS.map((f) => {
                  const isActive = filter === f.id
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilter(f.id)}
                      className={`px-2 py-1 rounded transition font-medium ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                          : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10'
                      }`}
                    >
                      {f.label} <span className={isActive ? 'opacity-70' : 'opacity-60'}>{filterCounts[f.id]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
              {filteredItemEntries.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">
                  Không có mục nào khớp filter này.
                </p>
              ) : (
                filteredItemEntries.map(({ item, key, itemState }) => (
                  <ChecklistItem
                    key={key}
                    item={item}
                    status={itemState?.status ?? 'unchecked'}
                    note={itemState?.note ?? ''}
                    onStatus={(s) => updateItem(key, { status: s })}
                    onNote={(n) => updateItem(key, { note: n })}
                    isExpanded={expandedItemId === key}
                    onToggle={() => setExpandedItemId((cur) => (cur === key ? null : key))}
                  />
                ))
              )}
            </div>

            <div className="border-t border-slate-200 p-3 shrink-0 dark:border-white/10">
              <SeniorReviewSummary lenses={phaseLenses} scores={phaseLensScores} avg={phaseAvgLensScore} />
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 mt-2">
                {allPassed
                  ? 'Tất cả check đã đạt. Có thể đánh dấu ảnh sẵn sàng review.'
                  : `Còn lại ${remainingCount} mục${needsFixCount > 0 ? ` · ${needsFixCount} mục cần sửa` : ''}.`}
              </p>
              <button
                disabled={!allPassed}
                onClick={() => update({ readyForReview: !state.readyForReview })}
                className={`w-full px-3 py-2.5 rounded-md text-sm font-medium transition ${
                  allPassed
                    ? state.readyForReview
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-white/5 dark:text-slate-500'
                }`}
              >
                {state.readyForReview && allPassed ? '✓ Đã đánh dấu sẵn sàng review' : 'Đánh dấu sẵn sàng review'}
              </button>
            </div>
          </aside>
        </div>
        </div>

        <div className={appMode === 'aireview' ? 'flex-1 flex flex-col min-h-0' : 'hidden'}>
          <AIReviewMode
            phaseOptions={aiPhaseOptions}
            projectType={state.projectType}
            markTypes={MARK_TYPES}
            marks={aiMarks}
            onAddMark={addAiMark}
            onClearMarks={clearAiMarks}
            selectedId={selectedAiMarkId}
            onSelect={setSelectedAiMarkId}
            onDeleteSelected={deleteSelectedAiMark}
          />
        </div>
      </main>

      <HelpPanel open={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  )
}

function LensGuidancePanel({ lens, score, onScore }) {
  const [expanded, setExpanded] = useState(true)
  return (
    <div className="border-b border-slate-200 bg-cyan-50/40 dark:border-white/10 dark:bg-cyan-500/5 shrink-0">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-cyan-100/40 dark:hover:bg-cyan-500/10 transition"
      >
        <ChevronIcon open={expanded} />
        <h3 className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide">
          {lens.title}
        </h3>
        <span className="ml-auto text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
          Senior Review Lens
        </span>
      </button>
      <div className="px-4 pb-3">
        {expanded && (
          <>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mb-2">
              {lens.purpose}
            </p>
            <ul className="text-[11px] text-slate-700 dark:text-slate-200 space-y-1 mb-2.5 list-disc list-inside">
              {lens.questions.map((q, i) => (
                <li key={i} className="leading-snug">{q}</li>
              ))}
            </ul>
          </>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Điểm lens:</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onScore(score === n ? null : n)}
              className={`w-7 h-7 text-[11px] font-semibold rounded transition ${
                score === n
                  ? 'bg-cyan-600 text-white dark:bg-cyan-500'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/10'
              }`}
            >
              {n}
            </button>
          ))}
          {expanded && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto">
              1=yếu · 3=ổn · 5=mạnh
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function MarksSummary({ marks, pinsSorted, markCounts, markTypes, selectedId, onSelect, onUpdateNote, onDelete, onClearAll }) {
  return (
    <div className="px-4 py-2.5 border-b border-slate-200 dark:border-white/10 shrink-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Marks ({marks.length})
        </span>
        <button
          type="button"
          onClick={onClearAll}
          className="text-[10px] text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition"
        >
          Xóa tất cả
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
        {markTypes.map((t) => (
          <span key={t.id} className="inline-flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-sm ${t.dotCls}`} />
            {t.label}: <span className="font-semibold tabular-nums">{markCounts[t.id]}</span>
          </span>
        ))}
      </div>
      {pinsSorted.length > 0 && (
        <div className="mt-2 space-y-1">
          {pinsSorted.map((pin, i) => (
            <div
              key={pin.id}
              className={`flex items-center gap-1.5 px-1.5 py-1 rounded ${
                selectedId === pin.id ? 'bg-purple-100 dark:bg-purple-500/15' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(pin.id)}
                className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-semibold shrink-0 flex items-center justify-center"
              >
                {i + 1}
              </button>
              <input
                type="text"
                value={pin.note || ''}
                onChange={(e) => onUpdateNote(pin.id, e.target.value)}
                placeholder="Ghi chú nếu cần…"
                className="flex-1 min-w-0 px-1.5 py-0.5 text-[11px] border border-slate-200 rounded bg-white dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/30"
              />
              <button
                type="button"
                onClick={() => onDelete(pin.id)}
                className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 text-xs px-1"
                title="Xóa pin"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SeniorReviewSummary({ lenses, scores, avg }) {
  if (!lenses || lenses.length === 0) return null
  return (
    <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-x-1.5 gap-y-1 flex-wrap">
      <span className="font-semibold text-slate-700 dark:text-slate-300">Senior Review:</span>
      <span className="tabular-nums font-semibold text-cyan-700 dark:text-cyan-300">
        {avg !== null ? `${avg.toFixed(1)}/5` : '—'}
      </span>
      <span className="text-slate-300 dark:text-slate-600">·</span>
      {lenses.map((l) => {
        const s = scores[l.id]
        return (
          <span key={l.id} className="tabular-nums" title={l.title}>
            {l.abbr}
            <span className={s == null ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200 font-semibold'}>
              {s == null ? '—' : s}
            </span>
          </span>
        )
      })}
    </div>
  )
}

function StatusPill({ label, color }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/15',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/35',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/35',
  }
  const dot = { slate: 'bg-slate-400 dark:bg-slate-300', emerald: 'bg-emerald-500', rose: 'bg-rose-500' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${colors[color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[color]}`} />
      {label}
    </span>
  )
}

function ChecklistItem({ item, status, note, onStatus, onNote, isExpanded, onToggle }) {
  const isFix = status === 'needsfix'
  const isPassed = status === 'passed'
  const hasNote = note && note.trim().length > 0

  const cardCls = `rounded-md border transition overflow-hidden ${
    isFix
      ? 'border-rose-300 bg-rose-50 dark:border-rose-500/35 dark:bg-rose-500/10'
      : isPassed
        ? 'border-emerald-200 bg-white dark:border-emerald-500/30 dark:bg-emerald-500/5'
        : 'border-slate-200 bg-white dark:border-white/10 dark:bg-[#1A2230]'
  }`

  return (
    <div className={cardCls}>
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          className="flex-1 flex items-start gap-2 px-3 py-2.5 text-left min-w-0 hover:bg-slate-50/70 dark:hover:bg-white/5 transition"
        >
          <ChevronIcon open={isExpanded} />
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium leading-snug truncate ${
                isFix ? 'text-rose-900 dark:text-rose-200' : 'text-slate-800 dark:text-slate-100'
              }`}
              title={item.title}
            >
              {item.title}
            </p>
            {!isExpanded && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {item.summary || item.lookAt}
              </p>
            )}
          </div>
          {hasNote && (
            <span
              className="shrink-0 mt-1 text-[10px] text-slate-400 dark:text-slate-500"
              title="Có ghi chú"
              aria-label="Có ghi chú"
            >●</span>
          )}
        </button>

        <div className="flex items-center pr-2 py-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <StatusToggle status={status} onChange={onStatus} />
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-2 border-t border-slate-100 dark:border-white/5" onClick={(e) => e.stopPropagation()}>
          <p className="text-[10px] italic text-slate-500 dark:text-slate-400 mb-2">
            Đọc mục này như câu hỏi tự kiểm trước khi đánh dấu Đạt.
          </p>
          <dl className="space-y-1 text-[11px] leading-snug text-slate-600 dark:text-slate-300">
            <div><dt className="inline font-semibold text-slate-500 dark:text-slate-400">Cần nhìn — </dt><dd className="inline">{item.lookAt}</dd></div>
            <div><dt className="inline font-semibold text-slate-500 dark:text-slate-400">Cách nhìn của senior — </dt><dd className="inline">{item.cue}</dd></div>
            <div><dt className="inline font-semibold text-amber-700 dark:text-amber-400">Lỗi thường gặp — </dt><dd className="inline">{item.common}</dd></div>
            <div><dt className="inline font-semibold text-emerald-700 dark:text-emerald-400">Hướng xử lý — </dt><dd className="inline">{item.fix}</dd></div>
            {item.selfCheck && (
              <div><dt className="inline font-semibold text-cyan-700 dark:text-cyan-300">Câu hỏi tự kiểm — </dt><dd className="inline">{item.selfCheck}</dd></div>
            )}
          </dl>
          <textarea
            value={note}
            onChange={(e) => onNote(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder={isFix ? 'Mô tả cần sửa…' : 'Ghi chú nếu cần…'}
            rows={isFix || note ? 2 : 1}
            className={`mt-2 w-full px-2.5 py-1.5 text-xs border rounded resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/15 placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-slate-100 ${
              isFix
                ? 'border-rose-200 bg-white focus:border-rose-400 dark:border-rose-500/30 dark:bg-slate-900'
                : 'border-slate-200 bg-white focus:border-slate-400 dark:border-white/10 dark:bg-slate-900 dark:focus:border-white/30'
            }`}
          />
        </div>
      )}
    </div>
  )
}

function StatusToggle({ status, onChange }) {
  const options = [
    { value: 'unchecked', label: 'Chưa kiểm', activeCls: 'bg-slate-200 text-slate-800 dark:bg-white/15 dark:text-slate-100', idleCls: 'text-slate-500 dark:text-slate-400' },
    { value: 'passed', label: 'Đạt', activeCls: 'bg-emerald-500 text-white', idleCls: 'text-emerald-700 dark:text-emerald-400' },
    { value: 'needsfix', label: 'Cần sửa', activeCls: 'bg-rose-500 text-white', idleCls: 'text-rose-700 dark:text-rose-400' },
  ]
  return (
    <div className="inline-flex rounded-md border border-slate-200 overflow-hidden text-[11px] font-medium bg-white dark:border-white/10 dark:bg-slate-900">
      {options.map((opt) => {
        const active = status === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(opt.value) }}
            className={`px-2.5 py-1 transition ${active ? opt.activeCls : `bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-white/10 ${opt.idleCls}`}`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 mt-1 text-slate-500 dark:text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} aria-hidden="true">
      <path d="M4 2l4 4-4 4" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function FocusIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
}

// Picks the most-relevant coach question based on context priority:
// expanded checklist item > active lens > phase default.
function FocusCoach({ phaseId, lensId, expandedItemKey }) {
  const itemCoach = expandedItemKey ? ITEM_COACH[expandedItemKey] : null
  const lensCoach = lensId ? LENS_COACH[`${phaseId}:${lensId}`] : null
  const phaseCoach = PHASE_COACH[phaseId]
  const coach = itemCoach || lensCoach || phaseCoach
  if (!coach) return null
  const source = itemCoach
    ? 'Theo checklist đang mở'
    : lensCoach
      ? 'Theo lens'
      : 'Theo phase'
  return (
    <div className="px-4 py-2.5 border-b border-slate-200 bg-amber-50/40 dark:border-white/10 dark:bg-amber-500/5 shrink-0">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
          <FocusIcon />
          Focus Coach
        </h3>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0">{source}</span>
      </div>
      <p className="text-[10px] italic text-slate-500 dark:text-slate-400 mb-1">Câu hỏi tự kiểm lúc này</p>
      <p className="text-xs font-medium leading-snug text-slate-800 dark:text-slate-100">
        {coach.question}
      </p>
      {coach.hint && (
        <p className="text-[11px] leading-snug text-slate-600 dark:text-slate-300 mt-1">
          {coach.hint}
        </p>
      )}
    </div>
  )
}

const QUICK_TESTS = [
  {
    title: '3-second test',
    text: 'Nhìn ảnh trong 3 giây: bạn có biết ngay công trình / không gian đang muốn khoe điều gì không?',
  },
  {
    title: 'Squint test',
    text: 'Nheo mắt hoặc thu nhỏ ảnh: hero có còn nổi lên rõ không, hay mọi thứ đều ngang nhau?',
  },
  {
    title: 'Main / Support / Noise test',
    text: 'Chỉ ra 3 lớp: chính, hỗ trợ, gây nhiễu. Nếu không phân được, ảnh đang thiếu hierarchy.',
  },
  {
    title: 'Detail trap test',
    text: 'Bạn có đang sửa tiểu tiết trong khi công trình chính, ánh sáng hoặc bố cục vẫn yếu không?',
  },
]

function HelpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  )
}

const HELP_STEPS = [
  {
    title: 'Mở ảnh local',
    body: 'Kéo ảnh vào vùng review hoặc bấm "Mở ảnh". Ảnh chỉ nằm trong trình duyệt, không upload.',
  },
  {
    title: 'Chọn phase cần kiểm',
    body: 'Bắt đầu từ "00. Storytelling" để xác định hero, mood và thông điệp chính trước khi check kỹ thuật.',
  },
  {
    title: 'Dùng checklist bên phải',
    body: 'Mở từng mục để đọc Cần nhìn / Cách nhìn của senior / Lỗi thường gặp / Hướng xử lý. Đánh dấu trạng thái:',
    list: ['Chưa kiểm', 'Đạt', 'Cần sửa'],
  },
  {
    title: 'Dùng Senior Review Lens',
    body: 'Mỗi phase có sẵn các lens (góc nhìn) — ví dụ Hero, Hierarchy, Framing, Material, Reflection, Tone & White Balance, Contrast & Balance. Chọn lens nào bạn muốn soi sâu, rồi cho điểm 1–5.',
  },
  {
    title: 'Theo dõi Focus Coach',
    body: 'Thẻ vàng "Focus Coach" ở trên cùng sidebar đưa ra một câu hỏi tự kiểm phù hợp với phase, lens hoặc mục checklist bạn đang mở. Đọc câu hỏi đó trước khi đánh giá.',
  },
  {
    title: 'Mark trực tiếp trên ảnh',
    body: 'Dùng Visual Marking để đánh dấu:',
    list: ['Vùng hero (điểm chính cần khoe)', 'Vùng hỗ trợ', 'Gây nhiễu', 'Cần sửa', 'Ghi chú'],
  },
  {
    title: 'Ghi note nếu cần',
    body: 'Ghi chú rõ lỗi hoặc hướng xử lý để tự sửa hoặc gửi lại lead review.',
  },
  {
    title: 'Chỉ đánh dấu sẵn sàng khi mọi mục đều Đạt',
    body: 'Nút "Sẵn sàng review" chỉ bật khi ảnh đã qua đủ checklist và không còn mục Cần sửa.',
  },
]

const FEEDBACK_QUESTIONS = [
  'Phần nào giúp bạn soi ảnh tốt hơn?',
  'Checklist nào quá dài hoặc khó hiểu?',
  'Có thuật ngữ nào chưa đúng workflow JCVIZ không?',
  'Visual Marking có dễ dùng không?',
  'Senior Review Lens có giúp bạn nhìn rõ hero / lỗi gây nhiễu không?',
  'Có thao tác nào bị khó click, lag hoặc rối không?',
]

const GLOSSARY = [
  { term: 'hero', def: 'điểm chính cần khoe trong ảnh' },
  { term: 'mood', def: 'cảm xúc tổng thể của ảnh' },
  { term: 'visual hierarchy', def: 'thứ tự chính phụ — thứ gì nhìn trước, thứ gì nhìn sau' },
  { term: 'focal length', def: 'độ rộng hoặc hẹp của ống kính camera' },
  { term: 'perspective', def: 'cảm giác phối cảnh — độ méo / độ sâu của góc nhìn' },
  { term: 'foreground', def: 'lớp phía trước ảnh' },
  { term: 'midground', def: 'lớp giữa ảnh' },
  { term: 'background', def: 'lớp nền phía sau' },
  { term: 'contrast', def: 'độ tương phản sáng tối' },
  { term: 'exposure', def: 'độ sáng tổng thể' },
  { term: 'saturation', def: 'độ bão hòa màu' },
  { term: 'highlight', def: 'vùng sáng mạnh trong ảnh' },
  { term: 'shadow', def: 'vùng tối hoặc bóng đổ' },
  { term: 'roughness', def: 'độ nhám / bóng của material' },
  { term: 'albedo', def: 'màu gốc của material' },
  { term: 'UVW mapping', def: 'cách texture bám lên model' },
  { term: 'denoise', def: 'khử noise sau render' },
  { term: 'fireflies', def: 'các đốm sáng lỗi xuất hiện trong render' },
  { term: 'color grading', def: 'chỉnh màu tổng thể của ảnh' },
  { term: 'crop', def: 'cắt khung hình' },
  { term: 'over-processing', def: 'chỉnh ảnh quá tay' },
  { term: 'vantage point', def: 'vị trí đặt camera trong scene' },
  { term: 'entourage', def: 'người, xe, cây — các yếu tố làm scene sống' },
  { term: 'IOR', def: 'chỉ số khúc xạ ánh sáng (Index of Refraction)' },
  { term: 'AO', def: 'ambient occlusion — bóng tối góc và khe hẹp' },
  { term: 'HDRI', def: 'ảnh môi trường 360° dùng cho lighting / reflection' },
]

function HelpPanel({ open, onClose }) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [showGlossary, setShowGlossary] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-panel-title"
    >
      <div
        className="bg-white dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-white/10 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-white/10 shrink-0">
          <h2 id="help-panel-title" className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Cách dùng Artist Self-QC
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            title="Đóng"
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 text-2xl leading-none px-2 -mr-1"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <ol className="space-y-3">
            {HELP_STEPS.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{s.title}</p>
                  {s.body && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug mt-1">
                      {s.body}
                    </p>
                  )}
                  {s.list && (
                    <ul className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-snug list-disc list-inside space-y-0.5">
                      {s.list.map((it, j) => (
                        <li key={j}>{it}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic border-t border-slate-200 dark:border-white/10 pt-3">
            App này không tự đánh giá ảnh bằng AI. Đây là công cụ hỗ trợ artist tự nhìn ảnh có hệ thống hơn.
          </p>

          <div className="border-t border-slate-200 dark:border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setShowGlossary((s) => !s)}
              className="w-full flex items-center justify-between gap-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition"
              aria-expanded={showGlossary}
            >
              <span>Thuật ngữ nhanh</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`shrink-0 transition-transform ${showGlossary ? 'rotate-90' : ''}`}
                aria-hidden="true"
              >
                <path d="M4 2l4 4-4 4" />
              </svg>
            </button>
            {showGlossary && (
              <>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Các thuật ngữ tiếng Anh thường dùng trong checklist và lens.
                </p>
                <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] leading-snug text-slate-600 dark:text-slate-300">
                  {GLOSSARY.map(({ term, def }) => (
                    <div key={term}>
                      <dt className="inline font-semibold text-slate-700 dark:text-slate-200">{term}</dt>
                      <dd className="inline">: {def}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setShowFeedback((s) => !s)}
              className="w-full flex items-center justify-between gap-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition"
              aria-expanded={showFeedback}
            >
              <span>Feedback sau khi dùng thử</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`shrink-0 transition-transform ${showFeedback ? 'rotate-90' : ''}`}
                aria-hidden="true"
              >
                <path d="M4 2l4 4-4 4" />
              </svg>
            </button>
            {showFeedback && (
              <>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Copy các câu hỏi này, trả lời và gửi cho team để tụi mình cải thiện app.
                </p>
                <ul className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-snug list-disc list-inside space-y-1">
                  {FEEDBACK_QUESTIONS.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <footer className="px-5 py-3 border-t border-slate-200 dark:border-white/10 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium rounded-md bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition"
          >
            Đã hiểu
          </button>
        </footer>
      </div>
    </div>
  )
}

function QuickTestsBlock() {
  return (
    <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 shrink-0 bg-amber-50/40 dark:bg-amber-500/5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">
        Test nhanh trước khi QC
      </div>
      <ol className="space-y-1.5 text-[11px] leading-snug text-slate-600 dark:text-slate-300">
        {QUICK_TESTS.map((t, i) => (
          <li key={i}>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {i + 1}. {t.title}.
            </span>{' '}
            {t.text}
          </li>
        ))}
      </ol>
    </div>
  )
}
