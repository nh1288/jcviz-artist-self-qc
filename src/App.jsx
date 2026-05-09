import { useState, useEffect } from 'react'
import ImageReviewHelper from './CompositionHelper.jsx'

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
      summary: 'Ảnh phải có một ý chính rõ ràng trước khi đi vào chi tiết.',
      lookAt: 'Nhìn tổng thể ảnh và tự hỏi: ảnh này đang bán điều gì — kiến trúc, lifestyle, sự riêng tư, cảnh quan, ánh sáng, tiện ích hay cảm giác cao cấp?',
      cue: 'Một ảnh tốt thường chỉ có một thông điệp chính. Nếu ảnh cố nói quá nhiều thứ cùng lúc, người xem sẽ không nhớ gì rõ ràng.',
      common: 'Ảnh có nhiều chi tiết đẹp nhưng không có trọng tâm; artist chăm cây, xe, người, texture nhưng công trình chính không nổi; mood và camera không phục vụ cùng một ý.',
      fix: 'Viết một câu ngắn cho ảnh: "Ảnh này bán ___". Sau đó giảm hoặc làm mềm những yếu tố không phục vụ câu này. Dùng framing, lighting, contrast và crop để đẩy thông điệp chính lên.',
      selfCheck: 'Nếu phải đặt tên cho ảnh này bằng 5 từ, bạn sẽ đặt là gì?',
    },
    {
      title: 'Hero element có đủ mạnh không',
      summary: 'Hero phải là thứ người xem nhìn thấy và nhớ đầu tiên.',
      lookAt: 'Xác định hero chính: facade, entrance, balcony, courtyard, pool, lobby, skyline, public plaza, landscape axis hoặc một khoảnh khắc lifestyle.',
      cue: 'Hero không nhất thiết phải nằm giữa ảnh, nhưng phải có lực hút thị giác mạnh nhất. Khi nheo mắt, hero vẫn phải đọc được.',
      common: 'Hero bị cây che, bị xe/người tranh attention, chìm trong shadow, quá nhỏ trong frame, hoặc không có contrast đủ mạnh so với xung quanh.',
      fix: 'Tăng priority cho hero bằng light, contrast, crop, camera angle, depth of field nhẹ, giảm saturation/contrast vùng phụ hoặc reposition entourage.',
      selfCheck: 'Khi nheo mắt, hero có còn là điểm sáng / contrast cao nhất không?',
    },
    {
      title: 'Chính / phụ / nền có rõ không',
      summary: 'Ảnh cần lớp chính, lớp hỗ trợ và nền — không phải mọi thứ quan trọng ngang nhau.',
      lookAt: 'Phân ảnh thành 3 lớp: Chính (thứ cần bán), Phụ (yếu tố hỗ trợ câu chuyện), Nền (bối cảnh tạo không khí).',
      cue: 'Nếu foreground, cây, sky, xe, người và công trình đều đòi attention như nhau, ảnh sẽ bị ồn. Visual hierarchy tốt nghĩa là vùng phụ biết lùi xuống.',
      common: 'Foreground quá nặng, sky quá đẹp nhưng lấn công trình, entourage quá nổi, cây xanh quá bão hòa, background quá sáng hoặc quá nhiều contrast.',
      fix: 'Giảm contrast / saturation / sharpness của vùng phụ. Tăng light hoặc clarity cho hero. Dùng crop và framing để loại bớt vùng không phục vụ ảnh.',
      selfCheck: 'Bạn có chỉ ra được rõ 3 lớp: chính, phụ, gây nhiễu không?',
    },
    {
      title: 'Đường dẫn mắt người xem',
      summary: 'Mắt người xem cần được dẫn vào hero một cách tự nhiên.',
      lookAt: 'Theo dõi mắt bạn đi qua ảnh: điểm đầu tiên nhìn vào là đâu, sau đó đi đâu, có quay lại hero không hay bị kéo ra ngoài frame?',
      cue: 'Ảnh mạnh thường có visual flow: foreground dẫn vào midground, ánh sáng dẫn vào hero, line kiến trúc dẫn vào focal point.',
      common: 'Mắt bị kéo vào góc ảnh, đường dẫn bị cây/xe chặn, vật sáng nằm sai chỗ, người xem nhìn sky hoặc foreground nhiều hơn công trình.',
      fix: 'Dùng leading lines, shadow, brightness, contrast, scale người/xe, hướng nhìn nhân vật, opening trong cây hoặc crop để dẫn mắt về hero.',
      selfCheck: 'Mắt bạn lượn theo trình tự nào trong ảnh — và cuối cùng dừng ở đâu?',
    },
    {
      title: 'Chi tiết có đang phục vụ câu chuyện không',
      summary: 'Chi tiết đẹp chỉ có giá trị khi nó giúp ảnh mạnh hơn.',
      lookAt: 'Kiểm tra các chi tiết như cây, xe, người, furniture, props, material detail, reflection, sky, birds, lights. Mỗi thứ có đang hỗ trợ câu chuyện không?',
      cue: 'Junior artist hay bị "detail trap": càng sửa nhiều chi tiết nhỏ, ảnh càng rối nếu direction chính chưa rõ.',
      common: 'Thêm người/xe cho đầy nhưng không có mục đích; cây che kiến trúc; reflection quá nổi; material chi tiết nhưng không ai nhìn vào hero.',
      fix: 'Xóa hoặc làm mềm chi tiết không cần thiết. Chỉ giữ những yếu tố giúp scale, lifestyle, depth, mood hoặc storytelling.',
      selfCheck: 'Nếu xóa 20% chi tiết phụ, ảnh có mạnh hơn hay yếu đi?',
    },
    {
      title: 'Mood có thống nhất không',
      summary: 'Camera, lighting, material, entourage và color grading phải cùng phục vụ một mood.',
      lookAt: 'Đánh giá cảm xúc tổng thể: premium, calm, resort, urban, vibrant, family, cinematic, private, public, commercial hoặc institutional.',
      cue: 'Mood tốt không đến từ một yếu tố riêng lẻ. Nó là kết quả của time of day, sky, lighting, material, activity, camera và post cùng nói một ngôn ngữ.',
      common: 'Ánh sáng luxury nhưng entourage quá casual; sky dramatic nhưng project cần calm; color grading lạnh nhưng material muốn warm; activity không khớp loại công trình.',
      fix: 'Chọn mood chính trước. Sau đó cân lại sky, time of day, light direction, saturation, contrast, entourage và color grading để mọi thứ đi cùng nhau.',
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
      { title: 'Góc camera khớp hướng đã duyệt', lookAt: 'So sánh góc render với reference, moodboard hoặc still đã được duyệt.', cue: 'Đứng lùi khỏi màn hình. Công trình đọc ngay từ ánh nhìn đầu có giống lúc duyệt brief không?', common: 'Camera lệch trục, lens quá rộng làm bóp công trình, vantage point khác hướng đã duyệt.', fix: 'Reset focal length và target về setup đã duyệt. Lock camera sau khi xác nhận.' },
      { title: 'Bố cục cân bằng', lookAt: 'Phân bố trọng lượng giữa foreground, mass công trình, sky và entourage.', cue: 'Hình dung nghiêng ảnh — có quadrant nào tự nhiên thấy trống hoặc nặng không?', common: 'Sky chiếm quá nhiều, horizon lệch, hero element bị đẩy ra góc, foreground trống.', fix: 'Re-frame, chỉnh crop, thêm foreground anchor hoặc đổi vantage để cân lại trọng lượng.' },
      { title: 'Đường thẳng đứng được kiểm soát', lookAt: 'Các cạnh đứng của công trình — cột, mullion, parapet, góc nhà.', cue: 'Đường vertical kiến trúc phải thẳng trừ khi méo có chủ đích. Kiểm tra song song với khung hình.', common: 'Vertical bị hội tụ (keystoning), tilt-shift sai, two-point perspective vỡ.', fix: 'Bật two-point perspective trên camera, dùng tilt-shift correction, hoặc fix trong post.' },
      { title: 'Focal length tự nhiên', lookAt: 'Compression của perspective — công trình có bị méo hoặc kéo dài không?', cue: 'Ống 24mm dễ làm cảm giác cường điệu; 28–50mm thường gần với architectural photography.', common: 'Cảm giác fisheye với 14–18mm, view xa thiếu compression, méo ở cạnh ảnh.', fix: 'Tăng focal length lên 28–50mm equivalent, hoặc lùi camera và re-frame.' },
      { title: 'Element thiết kế chính nhìn rõ', lookAt: 'Xác định hero của project — entry, facade signature, material story — và check xem có đọc được không.', cue: 'Nheo mắt nhìn ảnh. Hero vẫn phải là điểm bắt mắt khi chi tiết bị giảm.', common: 'Hero bị che bởi entourage, bị cây chắn, bị sky background nuốt mất.', fix: 'Reposition entourage, bỏ bớt cây, thêm rim light hướng, hoặc recompose để lộ hero.' },
      { title: 'Foreground, midground, background đọc rõ', lookAt: 'Layering chiều sâu — separation về tone, color hoặc detail giữa các depth plane.', cue: 'Che 1/3 ảnh từng phần. Mỗi layer vẫn phải đọc được riêng biệt.', common: 'Depth phẳng, các layer hòa vào một tone, thiếu atmospheric perspective, không có foreground anchor.', fix: 'Thêm haze, tăng value contrast giữa các layer, đặt thêm element foreground.' },
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
      { title: 'Material chính khớp reference', lookAt: 'Từng surface chính so với material spec hoặc reference đã duyệt.', cue: 'Đi qua ảnh từng surface một. Dừng ở chỗ không khớp brief và tự hỏi vì sao.', common: 'Tone gỗ sai, concrete generic thay vì polished, thiếu variation, sai loại đá.', fix: 'Đổi từ material library đã duyệt, chỉnh albedo, mở reference và tune lại.' },
      { title: 'Texture scale & mapping', lookAt: 'Các bề mặt lớn — sàn, đá, gỗ, facade panel, vải, tường.', cue: 'Tự hỏi texture có còn believable nếu có người 1.7m đứng cạnh không. Sai scale và stretched UV nhìn ra ngay.', common: 'Vân gỗ quá to, đá quá nhỏ, UV bị stretch, seam lộ, lặp tiling.', fix: 'Chỉnh UVW scale, rotation, randomization, dùng triplanar mapping, hoặc thay texture chất lượng cao hơn.' },
      { title: 'Không bị tiling hoặc stretching lộ rõ', lookAt: 'Bề mặt phẳng lặp lại — pavement, panel facade lớn, trần, tường.', cue: 'Pattern không nên hút mắt. Nếu mình nhìn ra repeat, client cũng sẽ nhìn ra.', common: 'Lặp motif rõ, mirrored seam, UV stretch ở góc, banding.', fix: 'Tăng resolution texture, randomize UV offset/rotation từng element, dùng procedural variation.' },
      { title: 'Hướng ánh sáng phù hợp với scene', lookAt: 'Sun azimuth và elevation, key vs fill, hướng shadow toàn scene.', cue: 'Trace một shadow ngược về source. Source đó có nhất quán với mọi shadow khác không?', common: 'Shadow conflict hướng, sun quá đỉnh đầu hoặc quá flat, fill light giết depth.', fix: 'Đổi giờ sun, cân lại fill/ambient, thêm rim hoặc back light để lộ form công trình.' },
      { title: 'Exposure & contrast cân bằng', lookAt: 'Pixel tối nhất và sáng nhất. Highlight không nên bị blown, shadow không nên bị crushed.', cue: 'Nheo mắt. Có vùng trắng pure hoặc đen pure đang nuốt detail mà mình muốn giữ không?', common: 'Highlight clip ở kính/sky, shadow detail bị crushed, midtone phẳng, contrast thấp.', fix: 'Chỉnh exposure, tone-mapping curve, raise shadows, recover highlights trong post.' },
      { title: 'Reflection & roughness chân thật', lookAt: 'Kính, sàn polish, panel kim loại, mặt nước.', cue: 'Reflection phải khớp với object xung quanh về vị trí và độ mềm. Bề mặt rough phải tán sáng, không soi gương.', common: 'Concrete bị mirror-glossy, reflection lệch khỏi environment, blurry chỗ phải sharp.', fix: 'Tune roughness map, fix reflection environment, verify IOR, tăng reflection samples.' },
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
    ],
  },
]

const LENSES = [
  {
    id: 'story', label: 'Story', abbr: 'S', title: 'Story Lens',
    purpose: 'Kiểm tra ảnh có kể đúng câu chuyện và bán đúng giá trị chính của project không.',
    questions: [
      'Ảnh này đang bán điều gì: kiến trúc, lifestyle, privacy, landscape, ánh sáng hay trải nghiệm?',
      'Hero element có rõ trong 3 giây đầu không?',
      'Mood có đúng với loại hình công trình không?',
      'Nhân vật, xe, cây và bối cảnh có hỗ trợ câu chuyện không?',
      'Nếu bỏ hết checklist kỹ thuật, ảnh này đã có cảm xúc chưa?',
    ],
  },
  {
    id: 'composition', label: 'Composition', abbr: 'C', title: 'Composition Lens',
    purpose: 'Kiểm tra cách mắt người xem đi qua ảnh và mức độ cân bằng thị giác.',
    questions: [
      'Mắt người xem đi từ đâu đến đâu?',
      'Foreground đang tạo chiều sâu hay che mất hero?',
      'Sky, công trình và landscape có cân bằng không?',
      'Vertical lines có được kiểm soát không?',
      'Có vùng nào quá nặng hoặc quá trống không?',
    ],
  },
  {
    id: 'lighting', label: 'Lighting', abbr: 'L', title: 'Lighting Lens',
    purpose: 'Kiểm tra ánh sáng có nâng mood, làm rõ kiến trúc và tạo chiều sâu không.',
    questions: [
      'Ánh sáng có làm nổi facade / hero chính không?',
      'Shadow còn đủ detail hay bị chết?',
      'Highlight trên tường trắng, kính, mái có bị gắt không?',
      'Interior light có tạo cảm giác sống không?',
      'Light direction có hỗ trợ story không?',
    ],
  },
  {
    id: 'material', label: 'Material', abbr: 'M', title: 'Material Lens',
    purpose: 'Kiểm tra material có believable, đúng scale và phản ứng ánh sáng hợp lý không.',
    questions: [
      'Đá, gỗ, tường, mái, kính, kim loại có đúng scale không?',
      'Roughness có tự nhiên không?',
      'Kính có depth hay bị đen / phẳng?',
      'Texture có bị lặp, stretch, sai mapping không?',
      'Material có đúng level premium của project không?',
    ],
  },
  {
    id: 'depth', label: 'Depth', abbr: 'D', title: 'Depth Lens',
    purpose: 'Kiểm tra ảnh có đủ lớp không gian và chiều sâu thị giác không.',
    questions: [
      'Foreground, midground, background có tách lớp rõ không?',
      'Cây, cổng, xe, người có giúp tạo depth không?',
      'Không gian có bị phẳng không?',
      'Shadow và atmospheric depth có dẫn mắt vào hero không?',
      'Có layer nào quá mạnh làm che mất layer chính không?',
    ],
  },
  {
    id: 'distraction', label: 'Distraction', abbr: 'X', title: 'Distraction Lens',
    purpose: 'Tìm các chi tiết đang kéo mắt khỏi hero hoặc làm giảm chất lượng ảnh.',
    questions: [
      'Có vật nào sáng quá, tối quá hoặc bão hòa quá không?',
      'Cây, xe, người, sky, foreground có chiếm attention quá mức không?',
      'Có chi tiết nào bị cắt khó chịu ở mép ảnh không?',
      'Có vùng nào làm ảnh rối hoặc kém premium không?',
      'Nếu xóa 1 chi tiết để ảnh mạnh hơn, đó là chi tiết nào?',
    ],
  },
  {
    id: 'premium', label: 'Premium Mood', abbr: 'P', title: 'Premium Mood Lens',
    purpose: 'Đánh giá cảm giác "đắt", high-end và mức độ hoàn thiện của ảnh.',
    questions: [
      'Ảnh có cảm giác luxury / premium chưa?',
      'Cảnh quan có đủ chăm chút không?',
      'Entrance, balcony, lighting, material có tạo cảm giác high-end không?',
      'Color grading có làm ảnh sang hơn hay làm ảnh rẻ đi?',
      'Ảnh này đã đủ mạnh để làm hero render chưa?',
    ],
  },
]

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
      lensScores: parsed.lensScores && typeof parsed.lensScores === 'object' ? parsed.lensScores : {},
    }
  } catch {
    return defaultState()
  }
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
  const [activeLens, setActiveLens] = useState(null)
  const [markMode, setMarkMode] = useState('select')
  const [selectedMarkId, setSelectedMarkId] = useState(null)
  const [showHelp, setShowHelp] = useState(false)

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
          lens: activeLens,
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
    if (confirm('Xóa tất cả marks?')) {
      setState((s) => ({ ...s, marks: [] }))
      setSelectedMarkId(null)
    }
  }

  const updateMarkNote = (id, note) =>
    setState((s) => ({
      ...s,
      marks: s.marks.map((m) => (m.id === id ? { ...m, note } : m)),
    }))

  const setLensScore = (lensId, score) =>
    setState((s) => ({
      ...s,
      lensScores: { ...s.lensScores, [lensId]: score },
    }))

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
      ? { label: 'Sẵn sàng', color: 'emerald' }
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

  // Senior Review Score average (only count scored lenses)
  const scoredLenses = LENSES.filter((l) => typeof state.lensScores[l.id] === 'number')
  const avgLensScore = scoredLenses.length === 0
    ? null
    : scoredLenses.reduce((sum, l) => sum + state.lensScores[l.id], 0) / scoredLenses.length

  // Mark counts by type
  const markCounts = MARK_TYPES.reduce((acc, t) => {
    acc[t.id] = state.marks.filter((m) => m.type === t.id).length
    return acc
  }, {})

  const activeLensData = activeLens ? LENSES.find((l) => l.id === activeLens) : null
  const activeLensScore = activeLens ? state.lensScores[activeLens] : null

  const resetAll = () => {
    if (confirm('Reset toàn bộ status, ghi chú, marks và điểm lens? Project info cũng sẽ bị xóa.')) {
      localStorage.removeItem(STORAGE_KEY)
      setState(defaultState())
      setSelectedMarkId(null)
      setActiveLens(null)
      setMarkMode('select')
    }
  }

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  // Pin numbering for sidebar mark list
  const pinsSorted = [...state.marks]
    .filter((m) => m.type === 'pin')
    .sort((a, b) => a.createdAt - b.createdAt)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-[#0B0F14] dark:text-slate-200">
      <header className="bg-white border-b border-slate-200 shrink-0 dark:bg-[#111827] dark:border-white/10">
        <div className="w-full px-4 py-2 flex items-center gap-3 flex-wrap">
          <div className="flex items-baseline gap-2 shrink-0">
            <h1 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">Artist Self-QC</h1>
          </div>
          <div className="flex-1 min-w-[260px] grid grid-cols-2 lg:grid-cols-4 gap-2">
            <input type="text" value={state.project} onChange={(e) => update({ project: e.target.value })} placeholder="Dự án" className={inputCls} />
            <input type="text" value={state.view} onChange={(e) => update({ view: e.target.value })} placeholder="View / Ảnh" className={inputCls} />
            <input type="text" value={state.artist} onChange={(e) => update({ artist: e.target.value })} placeholder="Artist" className={inputCls} />
            <input type="date" value={state.date} onChange={(e) => update({ date: e.target.value })} className={inputCls} />
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
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
            {avgLensScore !== null && (
              <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-500/15 dark:text-cyan-300 tabular-nums">
                Senior {avgLensScore.toFixed(1)}/5
              </span>
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
        <div className="border-b border-slate-200 shrink-0 dark:border-white/10">
          <nav className="flex gap-0.5 -mb-px overflow-x-auto">
            {PHASES.map((phase) => {
              const items = getActiveItems(phase.id, state.projectType)
              const phItems = items.map((_, idx) => state.items[getItemKey(phase.id, state.projectType, idx)])
              const phPassed = phItems.filter((it) => it?.status === 'passed').length
              const phFix = phItems.filter((it) => it?.status === 'needsfix').length
              const isActive = state.activePhase === phase.id
              return (
                <button
                  key={phase.id}
                  onClick={() => update({ activePhase: phase.id })}
                  className={`px-3 py-1.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                    isActive
                      ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  <span className="mr-1.5 text-[10px] text-slate-400 dark:text-slate-500">{phase.number}.</span>
                  {phase.name}
                  <span className="ml-1.5 text-[10px] text-slate-400 dark:text-slate-500">{phPassed}/{items.length}</span>
                  {phFix > 0 && (
                    <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-rose-500" title={`${phFix} mục cần sửa`}></span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_clamp(380px,26vw,480px)] gap-3 flex-1 min-h-0 lg:min-h-[620px]">
          <div className="min-w-0 min-h-0">
            <ImageReviewHelper
              phase={activePhase}
              lens={{ items: LENSES, active: activeLens, set: setActiveLens }}
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

            {activeLensData && (
              <LensGuidancePanel
                lens={activeLensData}
                score={activeLensScore}
                onScore={(n) => setLensScore(activeLensData.id, n)}
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
              <SeniorReviewSummary lensScores={state.lensScores} avg={avgLensScore} />
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
      </main>

      <HelpPanel open={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  )
}

function LensGuidancePanel({ lens, score, onScore }) {
  return (
    <div className="px-4 py-3 border-b border-slate-200 bg-cyan-50/40 dark:border-white/10 dark:bg-cyan-500/5 shrink-0">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide">
          {lens.title}
        </h3>
        <span className="text-[10px] text-slate-500 dark:text-slate-400">Senior Review Lens</span>
      </div>
      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mb-2">
        {lens.purpose}
      </p>
      <ul className="text-[11px] text-slate-700 dark:text-slate-200 space-y-1 mb-2.5 list-disc list-inside">
        {lens.questions.map((q, i) => (
          <li key={i} className="leading-snug">{q}</li>
        ))}
      </ul>
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
        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto">1=yếu · 3=ổn · 5=mạnh</span>
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
                placeholder="Ghi chú…"
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

function SeniorReviewSummary({ lensScores, avg }) {
  return (
    <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-x-1.5 gap-y-1 flex-wrap">
      <span className="font-semibold text-slate-700 dark:text-slate-300">Senior Review:</span>
      <span className="tabular-nums font-semibold text-cyan-700 dark:text-cyan-300">
        {avg !== null ? `${avg.toFixed(1)}/5` : '—'}
      </span>
      <span className="text-slate-300 dark:text-slate-600">·</span>
      {LENSES.map((l) => {
        const s = lensScores[l.id]
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
          <dl className="space-y-1 text-[11px] leading-snug text-slate-600 dark:text-slate-300">
            <div><dt className="inline font-semibold text-slate-500 dark:text-slate-400">Cần nhìn — </dt><dd className="inline">{item.lookAt}</dd></div>
            <div><dt className="inline font-semibold text-slate-500 dark:text-slate-400">Góc nhìn expert — </dt><dd className="inline">{item.cue}</dd></div>
            <div><dt className="inline font-semibold text-amber-700 dark:text-amber-400">Lỗi thường gặp — </dt><dd className="inline">{item.common}</dd></div>
            <div><dt className="inline font-semibold text-emerald-700 dark:text-emerald-400">Hướng xử lý — </dt><dd className="inline">{item.fix}</dd></div>
            {item.selfCheck && (
              <div><dt className="inline font-semibold text-cyan-700 dark:text-cyan-300">Câu hỏi tự check — </dt><dd className="inline">{item.selfCheck}</dd></div>
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
    body: 'Mở từng mục checklist để đọc hướng dẫn. Đánh dấu:',
    list: ['Chưa kiểm', 'Đạt', 'Cần sửa'],
  },
  {
    title: 'Dùng Senior Review Lens',
    body: 'Chọn lens như Story, Composition, Lighting, Material, Depth, Distraction hoặc Premium Mood để soi ảnh theo từng góc nhìn expert.',
  },
  {
    title: 'Mark trực tiếp trên ảnh',
    body: 'Dùng Visual Marking để đánh dấu:',
    list: ['Vùng hero', 'Vùng hỗ trợ', 'Gây nhiễu', 'Cần sửa', 'Ghi chú'],
  },
  {
    title: 'Ghi note nếu cần',
    body: 'Ghi chú rõ lỗi hoặc hướng xử lý để tự sửa hoặc gửi lại lead review.',
  },
  {
    title: 'Chỉ mark Ready khi tất cả checklist Đạt',
    body: 'Ready for Review chỉ nên dùng khi ảnh đã qua đủ checklist và không còn mục Cần sửa.',
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

function HelpPanel({ open, onClose }) {
  const [showFeedback, setShowFeedback] = useState(false)

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
